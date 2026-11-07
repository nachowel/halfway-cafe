import assert from "node:assert/strict";
import { test } from "node:test";

import {
  applyImageIntent,
  createCloudinaryReference,
  parseCloudinaryReference,
  sanitizeAssetFilename,
  type AdminImageIntent,
} from "./admin-image-core.ts";

test("stable Cloudinary references accept only the Halfway Cafe namespace", () => {
  const reference = createCloudinaryReference(
    "halfway-cafe/admin/cheese-burger--3fd8e390-975f-44a3-8ba2-3b4a3d43fb25",
  );

  assert.equal(
    reference,
    "cloudinary/halfway-cafe/admin/cheese-burger--3fd8e390-975f-44a3-8ba2-3b4a3d43fb25",
  );
  assert.equal(
    parseCloudinaryReference(reference),
    "halfway-cafe/admin/cheese-burger--3fd8e390-975f-44a3-8ba2-3b4a3d43fb25",
  );
  assert.equal(parseCloudinaryReference("cloudinary/herb-and-goods/logo"), null);
  assert.equal(parseCloudinaryReference("cloudinary/halfway-cafe/../secret"), null);
  assert.throws(() => createCloudinaryReference("other-brand/image"));
});

test("image patch semantics do not rewrite an unchanged legacy value", () => {
  const legacy = "https://project.supabase.co/storage/v1/object/sign/menu/image.jpg?token=secret";
  const unchanged: AdminImageIntent = { kind: "unchanged" };
  const replaced: AdminImageIntent = {
    kind: "replace",
    reference: "cloudinary/halfway-cafe/admin/new-image--3fd8e390-975f-44a3-8ba2-3b4a3d43fb25",
  };

  assert.deepEqual(applyImageIntent({}, "image_url", unchanged), {});
  assert.deepEqual(applyImageIntent({}, "image_url", replaced), {
    image_url:
      "cloudinary/halfway-cafe/admin/new-image--3fd8e390-975f-44a3-8ba2-3b4a3d43fb25",
  });
  assert.deepEqual(applyImageIntent({}, "image_url", { kind: "remove" }), {
    image_url: null,
  });
  assert.equal(legacy.includes("token=secret"), true);
});

test("unsafe filenames become bounded, path-free asset slugs", () => {
  assert.equal(sanitizeAssetFilename("../My Cheese & Bacon!!.JPG"), "my-cheese-bacon");
  assert.equal(sanitizeAssetFilename(".jpeg"), "image");
  assert.ok(sanitizeAssetFilename(`${"very-".repeat(30)}long.png`).length <= 60);
});
