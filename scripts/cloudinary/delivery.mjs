import { createHash, timingSafeEqual } from "node:crypto";

import {
  RESPONSIVE_WIDTHS,
  assertCloudinaryPublicId,
  canonicalStringify,
  sha256,
} from "./core.mjs";
import { verifyManifest } from "./manifest.mjs";

const VERIFIED_UPLOAD_STATUSES = new Set(["verified", "existing_verified"]);

function assertApiSecret(apiSecret) {
  if (typeof apiSecret !== "string" || apiSecret.length < 1) {
    throw new Error("Cloudinary API secret is unavailable");
  }
}

function assertDeliveryPath(deliveryPath) {
  if (
    typeof deliveryPath !== "string" ||
    deliveryPath.length < 1 ||
    deliveryPath.startsWith("/") ||
    /[?#]/.test(deliveryPath)
  ) {
    throw new Error("Cloudinary delivery path is not canonical");
  }
}

export function signCloudinaryDeliveryPath({
  deliveryPath,
  apiSecret,
  algorithm = "sha256",
}) {
  assertDeliveryPath(deliveryPath);
  assertApiSecret(apiSecret);
  if (algorithm !== "sha1" && algorithm !== "sha256") {
    throw new Error(`Unsupported Cloudinary delivery signature algorithm: ${algorithm}`);
  }
  return createHash(algorithm)
    .update(`${deliveryPath}${apiSecret}`, "utf8")
    .digest("base64url")
    .slice(0, 8);
}

export function verifyCloudinaryDeliverySignature({
  deliveryPath,
  signature,
  apiSecret,
  algorithm = "sha256",
}) {
  if (!/^[A-Za-z0-9_-]{8}$/.test(signature ?? "")) return false;
  const expected = signCloudinaryDeliveryPath({
    deliveryPath,
    apiSecret,
    algorithm,
  });
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function responsiveWidthsForIntrinsicWidth(intrinsicWidth) {
  if (!Number.isInteger(intrinsicWidth) || intrinsicWidth < 1) {
    throw new Error("Intrinsic image width must be a positive integer");
  }
  return [
    ...new Set(
      RESPONSIVE_WIDTHS.map((width) => Math.min(width, intrinsicWidth)),
    ),
  ];
}

function assertDeliveryIdentity({
  cloudName,
  publicId,
  version,
  format,
  width,
  intrinsicWidth,
}) {
  assertCloudinaryPublicId(publicId);
  if (!/^halfway-cafe\/[a-z0-9._/-]+$/.test(publicId)) {
    throw new Error("Cloudinary delivery requires a canonical public ID");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName)) {
    throw new Error("Invalid Cloudinary cloud name");
  }
  if (!Number.isInteger(Number(version)) || Number(version) < 1) {
    throw new Error(`Missing Cloudinary version for ${publicId}`);
  }
  if (!/^[a-z0-9]+$/i.test(format)) {
    throw new Error(`Invalid Cloudinary format for ${publicId}`);
  }
  if (!responsiveWidthsForIntrinsicWidth(intrinsicWidth).includes(width)) {
    throw new Error(
      `Width ${width} is not in the intrinsic-capped responsive width set`,
    );
  }
}

function buildDeliveryPath({ publicId, version, format, width }) {
  return `c_limit,w_${width}/f_auto/q_auto/v${version}/${publicId}.${format}`;
}

export function buildSignedCloudinaryDeliveryUrl({
  cloudName,
  apiSecret,
  publicId,
  version,
  format,
  width,
  intrinsicWidth,
}) {
  assertDeliveryIdentity({
    cloudName,
    publicId,
    version,
    format,
    width,
    intrinsicWidth,
  });
  const deliveryPath = buildDeliveryPath({ publicId, version, format, width });
  const signature = signCloudinaryDeliveryPath({ deliveryPath, apiSecret });
  return `https://res.cloudinary.com/${cloudName}/image/upload/s--${signature}--/${deliveryPath}`;
}

function verifyCompleteJournal(manifest, journal) {
  if (journal?.schemaVersion !== 1) {
    throw new Error("A version 1 upload journal is required");
  }
  if (journal.manifestSha256 !== manifest.manifestSha256) {
    throw new Error("Upload journal manifest digest does not match");
  }
  if (!journal.entries || typeof journal.entries !== "object") {
    throw new Error("Upload journal entries are missing");
  }

  const objectsByPublicId = new Map(
    manifest.objects.map((object) => [object.publicId, object]),
  );
  for (const [publicId, object] of objectsByPublicId) {
    const entry = journal.entries[publicId];
    if (!entry) throw new Error(`Upload journal entry is missing for ${publicId}`);
    if (!VERIFIED_UPLOAD_STATUSES.has(entry.status)) {
      throw new Error(`Upload journal entry is not verified for ${publicId}`);
    }
    if (entry.publicId !== publicId || entry.sourceSha256 !== object.sourceSha256) {
      throw new Error(`Upload journal source identity mismatch for ${publicId}`);
    }
    if (!Number.isInteger(Number(entry.version)) || Number(entry.version) < 1) {
      throw new Error(`Upload journal version is missing for ${publicId}`);
    }
  }

  const extras = Object.keys(journal.entries).filter(
    (publicId) => !objectsByPublicId.has(publicId),
  );
  if (extras.length) {
    throw new Error(`Upload journal contains extra entries: ${extras.length}`);
  }
  return objectsByPublicId;
}

function deliveryPlanDigestPayload(plan) {
  return {
    schemaVersion: plan.schemaVersion,
    generatedAt: plan.generatedAt,
    manifestSha256: plan.manifestSha256,
    cloudName: plan.cloudName,
    signatureAlgorithm: plan.signatureAlgorithm,
    transformationTemplate: plan.transformationTemplate,
    responsiveWidths: plan.responsiveWidths,
    objects: plan.objects,
    summary: plan.summary,
  };
}

export function computeSignedDeliveryPlanDigest(plan) {
  return sha256(canonicalStringify(deliveryPlanDigestPayload(plan)));
}

export function buildSignedDeliveryPlan({
  manifest,
  journal,
  cloudName,
  apiSecret,
  generatedAt = new Date().toISOString(),
}) {
  verifyManifest(manifest, {
    expectedSourceObjectCount: manifest.expectedSourceObjectCount,
  });
  const objectsByPublicId = verifyCompleteJournal(manifest, journal);
  assertApiSecret(apiSecret);

  const objects = [...objectsByPublicId.values()]
    .sort((left, right) => left.publicId.localeCompare(right.publicId))
    .map((object) => {
      const version = Number(journal.entries[object.publicId].version);
      const candidates = responsiveWidthsForIntrinsicWidth(object.width).map(
        (width) => ({
          width,
          url: buildSignedCloudinaryDeliveryUrl({
            cloudName,
            apiSecret,
            publicId: object.publicId,
            version,
            format: object.format,
            width,
            intrinsicWidth: object.width,
          }),
        }),
      );
      return {
        objectPath: object.objectPath,
        publicId: object.publicId,
        sourceSha256: object.sourceSha256,
        version,
        format: object.format,
        intrinsicWidth: object.width,
        intrinsicHeight: object.height,
        candidates,
      };
    });

  const plan = {
    schemaVersion: 1,
    generatedAt,
    manifestSha256: manifest.manifestSha256,
    cloudName,
    signatureAlgorithm: "sha256",
    transformationTemplate: "c_limit,w_<width>/f_auto/q_auto",
    responsiveWidths: [...RESPONSIVE_WIDTHS],
    objects,
    summary: {
      objects: objects.length,
      candidates: objects.reduce(
        (total, object) => total + object.candidates.length,
        0,
      ),
    },
  };
  plan.deliveryPlanSha256 = computeSignedDeliveryPlanDigest(plan);
  return plan;
}

export function verifySignedDeliveryPlan(plan, { manifest, journal, apiSecret }) {
  if (plan?.schemaVersion !== 1) {
    throw new Error("Unsupported signed delivery plan schema version");
  }
  const digest = computeSignedDeliveryPlanDigest(plan);
  if (digest !== plan.deliveryPlanSha256) {
    throw new Error("Signed delivery plan digest mismatch");
  }
  const expected = buildSignedDeliveryPlan({
    manifest,
    journal,
    cloudName: plan.cloudName,
    apiSecret,
    generatedAt: plan.generatedAt,
  });
  if (canonicalStringify(plan) !== canonicalStringify(expected)) {
    throw new Error("Signed delivery plan candidates or signatures do not match");
  }
  return true;
}
