import {
  inspectImage,
  normalizeSupabaseStorageUrl,
  sha256,
} from "./core.mjs";
import { buildSignedCloudinaryDeliveryUrl, responsiveWidthsForIntrinsicWidth } from "./delivery.mjs";
import { downloadSourceObject } from "./inventory.mjs";

function normalizeFormat(format) {
  return format === "jpeg" ? "jpg" : format;
}

function assertObjectIntegrity(object, buffer, metadata) {
  if (buffer.length !== object.bytes) {
    throw new Error(`Pilot source byte size changed for ${object.objectPath}`);
  }
  if (sha256(buffer) !== object.sourceSha256) {
    throw new Error(`Pilot source SHA-256 changed for ${object.objectPath}`);
  }
  if (
    normalizeFormat(metadata.format) !== normalizeFormat(object.format) ||
    metadata.width !== object.width ||
    metadata.height !== object.height
  ) {
    throw new Error(`Pilot source image metadata changed for ${object.objectPath}`);
  }
}

export async function loadVerifiedPilotSource({
  manifest,
  sourceSnapshot,
  publicId,
  fetchImpl = fetch,
}) {
  if (sourceSnapshot?.schemaVersion !== 1) {
    throw new Error("A version 1 private source snapshot is required");
  }
  if (sourceSnapshot.manifestSha256 !== manifest.manifestSha256) {
    throw new Error("Private source snapshot manifest digest does not match");
  }
  const matches = manifest.objects.filter((object) => object.publicId === publicId);
  if (matches.length !== 1) {
    throw new Error("Selected pilot public ID is not present exactly once in the manifest");
  }
  const object = matches[0];
  const references = sourceSnapshot.references.filter(
    (reference) => reference.objectPath === object.objectPath,
  );
  const source = references.find((reference) => {
    if (typeof reference.sourceUrl !== "string") return false;
    if (sha256(reference.sourceUrl) !== reference.sourceUrlFingerprint) return false;
    return object.sourceUrlFingerprints.includes(reference.sourceUrlFingerprint);
  });
  if (!source) {
    throw new Error(`No verified private source URL exists for ${object.objectPath}`);
  }
  const normalized = normalizeSupabaseStorageUrl(
    source.sourceUrl,
    manifest.sourceHost,
  );
  if (normalized.objectPath !== object.objectPath) {
    throw new Error(`Private source URL object mismatch for ${object.objectPath}`);
  }
  const downloaded = await downloadSourceObject({
    sourceUrl: source.sourceUrl,
    fetchImpl,
  });
  assertObjectIntegrity(object, downloaded.buffer, downloaded.metadata);
  return { object, buffer: downloaded.buffer };
}

export function selectPilotDeliveryWidths(intrinsicWidth) {
  const candidates = responsiveWidthsForIntrinsicWidth(intrinsicWidth);
  const selected = [256, 640, 1080]
    .map((target) => {
      const atOrBelow = candidates.filter((width) => width <= target);
      return atOrBelow.at(-1) ?? candidates[0];
    })
    .filter((width, index, values) => values.indexOf(width) === index);
  if (selected.length !== 3) {
    throw new Error("Pilot image must support at least three responsive widths");
  }
  return selected;
}

export async function verifyPilotDelivery({
  object,
  version,
  cloudName,
  apiSecret,
  fetchImpl = fetch,
}) {
  const widths = selectPilotDeliveryWidths(object.width);
  const results = [];
  for (const width of widths) {
    const url = buildSignedCloudinaryDeliveryUrl({
      cloudName,
      apiSecret,
      publicId: object.publicId,
      version,
      format: object.format,
      width,
      intrinsicWidth: object.width,
    });
    const response = await fetchImpl(url, {
      headers: {
        Accept: "image/avif,image/webp,image/jpeg,image/png,image/*;q=0.8,*/*;q=0.5",
      },
    });
    if (!response.ok) {
      throw new Error(`Pilot delivery failed at width ${width} with HTTP ${response.status}`);
    }
    const finalUrl = response.url || url;
    const parsed = new URL(finalUrl);
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "res.cloudinary.com" ||
      parsed.pathname.includes("/_next/image")
    ) {
      throw new Error(`Pilot delivery did not remain on the direct Cloudinary CDN`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const metadata = inspectImage(buffer);
    const expectedHeight = Math.round((object.height * width) / object.width);
    if (metadata.width !== width || metadata.height !== expectedHeight) {
      throw new Error(
        `Pilot delivery dimensions mismatch at width ${width}: expected ${width}x${expectedHeight}, received ${metadata.width}x${metadata.height}`,
      );
    }
    const contentType = response.headers.get("content-type")?.split(";", 1)[0] ?? null;
    if (contentType && contentType !== metadata.mimeType) {
      throw new Error(`Pilot delivery content type does not match decoded image data`);
    }
    results.push({
      width,
      height: metadata.height,
      status: response.status,
      bytes: buffer.length,
      format: metadata.format,
      contentType,
      formatNegotiated:
        normalizeFormat(metadata.format) !== normalizeFormat(object.format),
      directCloudinary: true,
    });
  }
  return results;
}
