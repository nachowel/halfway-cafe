import test from "node:test";
import assert from "node:assert/strict";

import { sha256 } from "./core.mjs";
import {
  loadVerifiedPilotSource,
  selectPilotDeliveryWidths,
  verifyPilotDelivery,
} from "./pilot.mjs";

function png(width, height, marker = 0) {
  const buffer = Buffer.alloc(25);
  Buffer.from("89504e470d0a1a0a", "hex").copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  buffer[24] = marker;
  return buffer;
}

function fixture() {
  const bytes = png(1184, 896, 1);
  const sourceUrl =
    "https://project.supabase.co/storage/v1/object/sign/menu/item.png?token=private";
  const object = {
    objectPath: "menu/item.png",
    publicId: `halfway-cafe/menu/item--${sha256(bytes).slice(0, 12)}`,
    sourceSha256: sha256(bytes),
    sourceUrlFingerprints: [sha256(sourceUrl)],
    bytes: bytes.length,
    format: "png",
    mimeType: "image/png",
    width: 1184,
    height: 896,
  };
  const manifest = {
    manifestSha256: "a".repeat(64),
    sourceHost: "project.supabase.co",
    objects: [object],
  };
  const snapshot = {
    schemaVersion: 1,
    manifestSha256: manifest.manifestSha256,
    references: [
      {
        objectPath: object.objectPath,
        sourceUrlFingerprint: sha256(sourceUrl),
        sourceUrl,
      },
    ],
  };
  return { bytes, manifest, object, snapshot, sourceUrl };
}

test("loads only the selected source URL and verifies its immutable manifest identity", async () => {
  const { bytes, manifest, object, snapshot, sourceUrl } = fixture();
  const requested = [];
  const result = await loadVerifiedPilotSource({
    manifest,
    sourceSnapshot: snapshot,
    publicId: object.publicId,
    fetchImpl: async (url) => {
      requested.push(url);
      return new Response(bytes, {
        status: 200,
        headers: { "content-type": "image/png" },
      });
    },
  });

  assert.deepEqual(requested, [sourceUrl]);
  assert.equal(result.object, object);
  assert.equal(result.buffer.equals(bytes), true);
});

test("rejects source snapshot drift and changed source bytes", async () => {
  const { bytes, manifest, object, snapshot } = fixture();
  await assert.rejects(
    loadVerifiedPilotSource({
      manifest,
      sourceSnapshot: { ...snapshot, manifestSha256: "b".repeat(64) },
      publicId: object.publicId,
    }),
    /snapshot manifest/i,
  );
  const changed = Buffer.from(bytes);
  changed[24] = 2;
  await assert.rejects(
    loadVerifiedPilotSource({
      manifest,
      sourceSnapshot: snapshot,
      publicId: object.publicId,
      fetchImpl: async () => new Response(changed, { status: 200 }),
    }),
    /sha-256/i,
  );
});

test("selects exactly three representative intrinsic-capped widths", () => {
  assert.deepEqual(selectPilotDeliveryWidths(1184), [256, 640, 1080]);
  assert.throws(() => selectPilotDeliveryWidths(192), /three responsive widths/i);
});

test("verifies three direct signed Cloudinary deliveries and decoded dimensions", async () => {
  const { object } = fixture();
  const requested = [];
  const result = await verifyPilotDelivery({
    object,
    version: 1234,
    cloudName: "shared-cloud",
    apiSecret: "private-secret",
    fetchImpl: async (url, options) => {
      requested.push({ url, accept: options.headers.Accept });
      const width = Number(url.match(/w_(\d+)/)?.[1]);
      return new Response(
        png(width, Math.round((object.height * width) / object.width)),
        { status: 200, headers: { "content-type": "image/png" } },
      );
    },
  });

  assert.deepEqual(result.map((entry) => entry.status), [200, 200, 200]);
  assert.deepEqual(result.map((entry) => entry.width), [256, 640, 1080]);
  assert.ok(result.every((entry) => entry.directCloudinary === true));
  assert.ok(requested.every(({ url }) => !url.includes("/_next/image")));
  assert.ok(requested.every(({ accept }) => accept.includes("image/avif")));
  assert.equal(JSON.stringify(result).includes("private-secret"), false);
  assert.equal(JSON.stringify(result).includes("s--"), false);
});

test("stops delivery verification on the first invalid response", async () => {
  const { object } = fixture();
  let requests = 0;
  await assert.rejects(
    verifyPilotDelivery({
      object,
      version: 1234,
      cloudName: "shared-cloud",
      apiSecret: "private-secret",
      fetchImpl: async () => {
        requests += 1;
        return new Response(png(1, 1), {
          status: 200,
          headers: { "content-type": "image/png" },
        });
      },
    }),
    /dimensions/i,
  );
  assert.equal(requests, 1);
});
