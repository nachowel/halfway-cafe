import assert from "node:assert/strict";
import { test } from "node:test";

import { buildGalleryImageValues, buildImageSettingChanges } from "./admin-write-core.ts";

test("unrelated gallery edits preserve the opaque legacy image without returning it to the client", () => {
  const current = new Map([["11111111-1111-4111-8111-111111111111", "https://supabase.test/sign/menu.jpg?token=private"]]);
  const values = buildGalleryImageValues(
    [
      {
        id: "11111111-1111-4111-8111-111111111111",
        imageIntent: { kind: "unchanged" },
      },
    ],
    current,
  );
  assert.deepEqual(values, [
    {
      id: "11111111-1111-4111-8111-111111111111",
      url: "https://supabase.test/sign/menu.jpg?token=private",
    },
  ]);
});

test("new gallery rows require a verified replacement and removals cannot create partial rows", () => {
  assert.throws(
    () => buildGalleryImageValues([{ id: "new", imageIntent: { kind: "unchanged" } }], new Map()),
    /requires an image/,
  );
  assert.throws(
    () => buildGalleryImageValues([{ id: "old", imageIntent: { kind: "remove" } }], new Map([["old", "legacy"]])),
    /cannot be saved without an image/,
  );
});

test("settings emit image writes only for explicit replace or remove operations", () => {
  assert.deepEqual(buildImageSettingChanges({ hero: { kind: "unchanged" } }), []);
  assert.deepEqual(
    buildImageSettingChanges({
      hero: {
        kind: "replace",
        reference: "cloudinary/halfway-cafe/admin/hero--uuid",
      },
      logo: { kind: "remove" },
    }),
    [
      { key: "hero", value: "cloudinary/halfway-cafe/admin/hero--uuid" },
      { key: "logo", value: null },
    ],
  );
});
