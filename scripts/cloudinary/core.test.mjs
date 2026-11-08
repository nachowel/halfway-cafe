import test from "node:test";
import assert from "node:assert/strict";

import {
  RetryableHttpError,
  assertCloudinaryPublicId,
  buildCloudinaryDeliveryUrl,
  canonicalStringify,
  createPublicId,
  inspectImage,
  normalizeSupabaseStorageUrl,
  redactUrl,
  sha256,
  withRetry,
} from "./core.mjs";

test("normalizes signed and public Supabase URLs to the same object", () => {
  const signed = normalizeSupabaseStorageUrl(
    "https://example.supabase.co/storage/v1/object/sign/set%20breakfast/Builder.png?token=secret",
    "example.supabase.co",
  );
  const publicUrl = normalizeSupabaseStorageUrl(
    "https://example.supabase.co/storage/v1/object/public/set%20breakfast/Builder.png",
    "example.supabase.co",
  );

  assert.equal(signed.objectPath, "set breakfast/Builder.png");
  assert.equal(publicUrl.objectPath, signed.objectPath);
  assert.equal(signed.mode, "signed");
  assert.equal(publicUrl.mode, "public");
  assert.notEqual(signed.sourceUrlFingerprint, publicUrl.sourceUrlFingerprint);
});

test("rejects a Supabase URL from an unexpected host", () => {
  assert.throws(
    () =>
      normalizeSupabaseStorageUrl(
        "https://other.supabase.co/storage/v1/object/public/Hero/logo.png",
        "expected.supabase.co",
      ),
    /unexpected Supabase host/i,
  );
});

test("redacts query values from URLs", () => {
  assert.equal(
    redactUrl("https://example.test/image.png?token=secret&x=1"),
    "https://example.test/image.png?<redacted>",
  );
});

test("creates deterministic prefix-isolated Cloudinary public IDs", () => {
  const digest = "a770d412c9c05ee8647988a328b75d1186473ea238e76c907b008a2263debbc9";
  const first = createPublicId("Hero/hero1.png", digest);
  const second = createPublicId("Hero/hero1.png", digest);

  assert.equal(first, "halfway-cafe/hero/hero1--a770d412c9c0");
  assert.equal(second, first);
  assert.doesNotThrow(() => assertCloudinaryPublicId(first));
  assert.throws(() => assertCloudinaryPublicId("herb-and-goods/hero"), /prefix/i);
});

test("canonical JSON and SHA-256 are stable across object key order", () => {
  const left = canonicalStringify({ b: 2, a: { d: 4, c: 3 } });
  const right = canonicalStringify({ a: { c: 3, d: 4 }, b: 2 });

  assert.equal(left, right);
  assert.equal(sha256(left), sha256(right));
});

test("inspects PNG dimensions from the image header", () => {
  const png = Buffer.alloc(24);
  Buffer.from("89504e470d0a1a0a", "hex").copy(png, 0);
  png.writeUInt32BE(13, 8);
  png.write("IHDR", 12, "ascii");
  png.writeUInt32BE(1200, 16);
  png.writeUInt32BE(896, 20);

  assert.deepEqual(inspectImage(png), {
    format: "png",
    mimeType: "image/png",
    width: 1200,
    height: 896,
  });
});

test("inspects JPEG dimensions from a SOF marker", () => {
  const jpeg = Buffer.from([
    0xff, 0xd8,
    0xff, 0xc0, 0x00, 0x11, 0x08,
    0x03, 0x80,
    0x04, 0xb0,
    0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00,
    0xff, 0xd9,
  ]);

  assert.deepEqual(inspectImage(jpeg), {
    format: "jpg",
    mimeType: "image/jpeg",
    width: 1200,
    height: 896,
  });
});

test("inspects WebP VP8X dimensions", () => {
  const webp = Buffer.alloc(30);
  webp.write("RIFF", 0, "ascii");
  webp.writeUInt32LE(22, 4);
  webp.write("WEBP", 8, "ascii");
  webp.write("VP8X", 12, "ascii");
  webp.writeUInt32LE(10, 16);
  webp.writeUIntLE(1791, 24, 3);
  webp.writeUIntLE(1023, 27, 3);

  assert.deepEqual(inspectImage(webp), {
    format: "webp",
    mimeType: "image/webp",
    width: 1792,
    height: 1024,
  });
});

test("inspects AVIF dimensions from the primary item property", () => {
  const avif = Buffer.alloc(40);
  avif.writeUInt32BE(24, 0);
  avif.write("ftyp", 4, "ascii");
  avif.write("avif", 8, "ascii");
  avif.writeUInt32BE(0, 12);
  avif.write("avif", 16, "ascii");
  avif.write("mif1", 20, "ascii");
  avif.writeUInt32BE(20, 24);
  avif.write("ispe", 28, "ascii");
  avif.writeUInt32BE(0, 32);
  avif.writeUInt32BE(1080, 36);
  const withHeight = Buffer.concat([avif, Buffer.alloc(4)]);
  withHeight.writeUInt32BE(817, 40);

  assert.deepEqual(inspectImage(withHeight), {
    format: "avif",
    mimeType: "image/avif",
    width: 1080,
    height: 817,
  });
});

test("rejects unrecognized or incomplete image data", () => {
  assert.throws(() => inspectImage(Buffer.from("not an image")), /unsupported/i);
});

test("retries transient failures and honors the requested delay", async () => {
  let attempts = 0;
  const delays = [];
  const result = await withRetry(
    async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new RetryableHttpError("busy", 429, 7);
      }
      return "ok";
    },
    {
      maxAttempts: 4,
      sleep: async (milliseconds) => delays.push(milliseconds),
      random: () => 0,
    },
  );

  assert.equal(result, "ok");
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [7000, 7000]);
});

test("does not retry permanent failures", async () => {
  let attempts = 0;
  await assert.rejects(
    withRetry(
      async () => {
        attempts += 1;
        const error = new Error("forbidden");
        error.status = 403;
        throw error;
      },
      { sleep: async () => {} },
    ),
    /forbidden/,
  );
  assert.equal(attempts, 1);
});

test("retries aborted network requests", async () => {
  let attempts = 0;
  const result = await withRetry(
    async () => {
      attempts += 1;
      if (attempts === 1) {
        const error = new Error("timed out");
        error.name = "AbortError";
        throw error;
      }
      return "recovered";
    },
    { sleep: async () => {}, random: () => 0 },
  );
  assert.equal(result, "recovered");
  assert.equal(attempts, 2);
});

test("builds canonical finite-width Cloudinary delivery URLs", () => {
  const url = buildCloudinaryDeliveryUrl({
    cloudName: "shared-cloud",
    publicId: "halfway-cafe/hero/hero1--a770d412c9c0",
    version: 1234,
    format: "png",
    width: 828,
  });

  assert.equal(
    url,
    "https://res.cloudinary.com/shared-cloud/image/upload/c_limit,w_828/f_auto/q_auto/v1234/halfway-cafe/hero/hero1--a770d412c9c0.png",
  );
  assert.throws(
    () =>
      buildCloudinaryDeliveryUrl({
        cloudName: "shared-cloud",
        publicId: "halfway-cafe/hero/test--aaaaaaaaaaaa",
        version: 1,
        format: "png",
        width: 500,
      }),
    /finite responsive width/i,
  );
});
