import assert from "node:assert/strict";
import { test } from "node:test";

import {
  applyAdminImageIntent,
  parseAdminCloudinaryReference,
  resolveAdminLogicalImagePreviewCore,
} from "./admin-menu-image-core.ts";

const LOGICAL_REFERENCE =
  "cloudinary/halfway-cafe/set-breakfast/set2--80c9fed3752e";
const PUBLIC_ID = "halfway-cafe/set-breakfast/set2--80c9fed3752e";
const LEGACY_URL =
  "https://project.supabase.co/storage/v1/object/sign/menu/set2.png?token=private";

test("image intents preserve unchanged values and save only original sources", () => {
  const base = { name: "Set Breakfast 2" };

  assert.deepEqual(
    applyAdminImageIntent(base, "image_url", { kind: "unchanged" }),
    base,
  );
  assert.deepEqual(
    applyAdminImageIntent(base, "image_url", {
      kind: "replace",
      reference: LEGACY_URL,
    }),
    { ...base, image_url: LEGACY_URL },
  );
  assert.deepEqual(
    applyAdminImageIntent(base, "image_url", {
      kind: "replace",
      reference: LOGICAL_REFERENCE,
    }),
    { ...base, image_url: LOGICAL_REFERENCE },
  );
  assert.deepEqual(
    applyAdminImageIntent(base, "image_url", { kind: "remove" }),
    { ...base, image_url: null },
  );
});

test("logical references accept only normalized Halfway Cafe public IDs", () => {
  assert.equal(parseAdminCloudinaryReference(LOGICAL_REFERENCE), PUBLIC_ID);

  const rejected = [
    "cloudinary/",
    "cloudinary/other-cafe/set2",
    "cloudinary/halfway-cafe/../secret",
    "cloudinary/halfway-cafe/menu//set2",
    "cloudinary/halfway-cafe/menu/set 2",
    "cloudinary/halfway-cafe/menu/set2?download=1",
    "cloudinary/halfway-cafe/menu/set2#fragment",
    "cloudinary/halfway-cafe/menu/set2/",
    "cloudinary/halfway-cafe/menu\\set2",
    "cloudinary/halfway-cafe/%2e%2e%2fsecret",
  ];

  for (const reference of rejected) {
    assert.equal(parseAdminCloudinaryReference(reference), null, reference);
  }
});

test("admin preview resolution uses approved static metadata before the registry", async () => {
  let registryCalls = 0;
  const preview = await resolveAdminLogicalImagePreviewCore({
    source: LOGICAL_REFERENCE,
    staticAssets: [{ publicId: PUBLIC_ID, objectPath: "set breakfast/set2.png" }],
    resolveStatic: async (asset) => ({ src: `https://static.example/${asset.objectPath}` }),
    resolveRegistered: async () => {
      registryCalls += 1;
      return { src: "https://registry.example/image.webp" };
    },
  });

  assert.deepEqual(preview, { src: "https://static.example/set breakfast/set2.png" });
  assert.equal(registryCalls, 0);
});

test("admin preview resolution falls back to the registry for future assets", async () => {
  const futureReference = "cloudinary/halfway-cafe/admin/future--asset";
  const preview = await resolveAdminLogicalImagePreviewCore({
    source: futureReference,
    staticAssets: [],
    resolveStatic: async () => null,
    resolveRegistered: async (reference) => ({
      src: `https://registry.example/${reference}`,
    }),
  });

  assert.deepEqual(preview, {
    src: `https://registry.example/${futureReference}`,
  });
});

test("malformed references and resolver failures produce no preview", async () => {
  let calls = 0;
  const dependencies = {
    staticAssets: [],
    resolveStatic: async () => {
      calls += 1;
      return { src: "unexpected" };
    },
    resolveRegistered: async () => {
      calls += 1;
      throw new Error("registry unavailable");
    },
  };

  assert.equal(
    await resolveAdminLogicalImagePreviewCore({
      source: "cloudinary/halfway-cafe/../secret",
      ...dependencies,
    }),
    null,
  );
  assert.equal(calls, 0);

  assert.equal(
    await resolveAdminLogicalImagePreviewCore({
      source: "cloudinary/halfway-cafe/admin/future--asset",
      ...dependencies,
    }),
    null,
  );
  assert.equal(calls, 1);
});
