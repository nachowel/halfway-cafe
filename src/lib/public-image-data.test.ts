import test from "node:test";
import assert from "node:assert/strict";

import { defaultImageSizes, withoutImageSource } from "./public-image-data.ts";

test("removes signed image source fields without mutating the database row", () => {
  const row = {
    id: "1",
    name: "Breakfast",
    image_url: "https://project.supabase.co/storage/v1/object/sign/menu/item.png?token=secret",
  };
  const safe = withoutImageSource(row);
  assert.deepEqual(safe, { id: "1", name: "Breakfast" });
  assert.equal(JSON.stringify(safe).includes("token="), false);
  assert.equal(row.image_url.includes("token="), true);
});

test("uses explicit sizes or a fixed display width while leaving fill layouts responsive", () => {
  assert.equal(defaultImageSizes({ sizes: "50vw", width: 40, fill: false }), "50vw");
  assert.equal(defaultImageSizes({ width: 40, fill: false }), "40px");
  assert.equal(defaultImageSizes({ width: 40, fill: true }), undefined);
});
