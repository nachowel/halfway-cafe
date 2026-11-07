import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MAX_IMAGE_BYTES,
  UploadValidationError,
  assertAllowedClaimedMime,
  assertImageMetadata,
  readBodyWithLimit,
} from "./admin-upload-core.ts";

test("upload validation allows only JPEG, PNG, and WebP with matching metadata", () => {
  assert.doesNotThrow(() => assertAllowedClaimedMime("image/jpeg"));
  assert.throws(() => assertAllowedClaimedMime("image/svg+xml"), UploadValidationError);
  assert.deepEqual(
    assertImageMetadata(
      { format: "webp", width: 1200, height: 800, pages: 1 },
      "image/webp",
    ),
    { format: "webp", mime: "image/webp", width: 1200, height: 800 },
  );
  assert.throws(
    () => assertImageMetadata({ format: "jpeg", width: 1200, height: 800 }, "image/png"),
    /does not match/,
  );
  assert.throws(
    () => assertImageMetadata({ format: "webp", width: 6000, height: 6000 }, "image/webp"),
    /25 megapixels/,
  );
  assert.throws(
    () => assertImageMetadata({ format: "webp", width: 100, height: 100, pages: 2 }, "image/webp"),
    /multi-page/,
  );
});

test("streamed request bodies stop at the 4 MB application limit", async () => {
  const accepted = new Request("https://example.test/upload", {
    method: "POST",
    body: new Uint8Array(32),
  });
  assert.equal((await readBodyWithLimit(accepted, 32)).byteLength, 32);

  const rejected = new Request("https://example.test/upload", {
    method: "POST",
    body: new Uint8Array(33),
  });
  await assert.rejects(() => readBodyWithLimit(rejected, 32), /maximum allowed size/);
  assert.equal(MAX_IMAGE_BYTES, 4_000_000);
});
