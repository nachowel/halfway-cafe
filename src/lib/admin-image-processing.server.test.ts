import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";

import { validateAndNormalizeImage } from "./admin-image-processing.server.ts";

test("real image decoding strips metadata and returns verified upload metadata", async () => {
  const source = await sharp({
    create: { width: 10, height: 5, channels: 3, background: "#ff6600" },
  })
    .jpeg({ quality: 95 })
    .withMetadata({ comment: "should not survive" })
    .toBuffer();

  const result = await validateAndNormalizeImage(source, "image/jpeg", "../Hero Photo.JPG");
  const decoded = await sharp(result.buffer).metadata();

  assert.equal(result.format, "jpeg");
  assert.equal(result.mime, "image/jpeg");
  assert.equal(result.width, 10);
  assert.equal(result.height, 5);
  assert.equal(result.safeFilename, "hero-photo.jpg");
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
  assert.equal(decoded.format, "jpeg");
  assert.equal(decoded.width, 10);
  assert.equal(decoded.height, 5);
  assert.equal(decoded.comments, undefined);
});

test("decoded bytes, not a forged MIME header, determine acceptance", async () => {
  const png = await sharp({
    create: { width: 8, height: 8, channels: 4, background: "#ffffff" },
  })
    .png()
    .toBuffer();

  await assert.rejects(
    () => validateAndNormalizeImage(png, "image/jpeg", "fake.jpg"),
    /does not match/,
  );
});
