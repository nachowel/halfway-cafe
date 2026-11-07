import assert from "node:assert/strict";
import { test } from "node:test";

import { buildAssetPickerRecords } from "./admin-image-picker-core.ts";

test("the picker contains only explicit Halfway mapping and ready registry records", () => {
  const records = buildAssetPickerRecords(
    [
      {
        objectPath: "menu/Cheese Burger.jpg",
        publicId: "halfway-cafe/menu/cheese-burger--0123456789ab",
        version: 1,
        format: "jpg",
        width: 1200,
        height: 800,
      },
    ],
    [
      {
        public_id: "halfway-cafe/admin/new-drink--uuid",
        original_filename: "New Drink.webp",
        version: 2,
        format: "webp",
        width: 600,
        height: 900,
        status: "ready",
      },
      {
        public_id: "herb-and-goods/private/logo",
        original_filename: "logo.png",
        version: 3,
        format: "png",
        width: 100,
        height: 100,
        status: "ready",
      },
    ],
  );

  assert.equal(records.length, 2);
  assert.deepEqual(records.map((record) => record.reference), [
    "cloudinary/halfway-cafe/menu/cheese-burger--0123456789ab",
    "cloudinary/halfway-cafe/admin/new-drink--uuid",
  ]);
  assert.equal(records.some((record) => record.reference.includes("herb-and-goods")), false);
});
