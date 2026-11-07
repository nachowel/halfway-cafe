import assert from "node:assert/strict";
import { test } from "node:test";

import * as cloudinaryUploadCore from "./cloudinary-upload-core.ts";

const { buildCloudinaryUploadOptions } = cloudinaryUploadCore;

test("Cloudinary writes are namespace-bound and can never overwrite", () => {
  const options = buildCloudinaryUploadOptions(
    "halfway-cafe/admin/hero--uuid",
    "hero.jpg",
  );
  assert.deepEqual(options, {
    resource_type: "image",
    type: "upload",
    public_id: "halfway-cafe/admin/hero--uuid",
    overwrite: false,
    invalidate: false,
    unique_filename: false,
    use_filename: false,
    filename_override: "hero.jpg",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  });
  assert.throws(() => buildCloudinaryUploadOptions("herb-and-goods/logo", "logo.png"));
});

test("Cloudinary nested 404 responses are recognized as missing assets", () => {
  const helper = (cloudinaryUploadCore as Record<string, unknown>).cloudinaryHttpCode;
  assert.equal(typeof helper, "function");
  assert.equal(
    (helper as (error: unknown) => number)({ error: { http_code: 404 } }),
    404,
  );
});
