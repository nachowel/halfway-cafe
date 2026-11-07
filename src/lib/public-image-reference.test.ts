import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createCloudinaryResolvedImage,
  createPublicImageResolver,
} from "./public-image-core.ts";
import type { CloudinaryAssetMapping } from "../types/public-image.ts";

const mapping: CloudinaryAssetMapping = {
  schemaVersion: 1,
  manifestSha256: "a".repeat(64),
  sourceHost: "project.supabase.co",
  assets: [
    {
      objectPath: "menu/Cheese Burger.jpg",
      publicId: "halfway-cafe/menu/cheese-burger--0123456789ab",
      version: 123,
      format: "jpg",
      width: 1200,
      height: 800,
    },
  ],
};

test("the immutable 101-style mapping also resolves a stable logical reference", () => {
  const resolve = createPublicImageResolver({ mapping, cloudName: "demo", apiSecret: "secret" });
  const image = resolve(
    "cloudinary/halfway-cafe/menu/cheese-burger--0123456789ab",
    "card",
  );

  assert.equal(image?.provider, "cloudinary");
  assert.equal(image?.width, 1200);
  assert.match(image?.src ?? "", /res\.cloudinary\.com\/demo\/image\/upload\/s--[A-Za-z0-9_-]{8}--/);
  assert.match(image?.src ?? "", /c_limit,w_828\/q_auto\/f_webp\/v123/);
});

test("dynamic registry metadata produces the same finite signed WebP lattice", () => {
  const image = createCloudinaryResolvedImage(
    {
      objectPath: "cloudinary/halfway-cafe/admin/new--uuid",
      publicId: "halfway-cafe/admin/new--uuid",
      version: 456,
      format: "png",
      width: 700,
      height: 350,
    },
    "hero",
    "demo",
    "secret",
  );

  assert.deepEqual(image.widths, [96, 192, 256, 384, 640, 700]);
  assert.equal(image.width, 700);
  assert.equal(image.height, 350);
  assert.match(image.src, /c_limit,w_700\/q_auto\/f_webp\/v456/);
  assert.equal(image.srcSet?.split(", ").length, 6);
});
