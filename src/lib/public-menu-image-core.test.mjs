import assert from "node:assert/strict";
import { test } from "node:test";

import {
  parseCloudinaryReference,
  resolvePublicMenuItemImage,
  resolvePublicMenuImageCore,
  signCloudinaryDeliveryPath,
} from "./public-menu-image-core.ts";

const FISH_PUBLIC_ID =
  "halfway-cafe/admin/fish-finger--b9a2ddef-c333-441d-a40f-3f73b1afc52c";

test("parses a Phase 8E Cloudinary logical reference", () => {
  assert.equal(parseCloudinaryReference(`cloudinary/${FISH_PUBLIC_ID}`), FISH_PUBLIC_ID);
});

test("rejects malformed, traversal, and URL-injection references", () => {
  const rejected = [
    "",
    "cloudinary/",
    "cloudinary/other-cafe/admin/image--uuid",
    "cloudinary/halfway-cafe/Admin/image--uuid",
    "cloudinary/halfway-cafe/admin/image name--uuid",
    "cloudinary/halfway-cafe/admin/../secret",
    "cloudinary/halfway-cafe/admin//image--uuid",
    "cloudinary/halfway-cafe/admin/image--uuid/",
    "cloudinary/halfway-cafe/admin/image--uuid?download=1",
    "cloudinary/halfway-cafe/admin/image--uuid#fragment",
    "cloudinary/https://res.cloudinary.com/attack",
    "cloudinary/halfway-cafe/admin/%2e%2e%2fsecret",
    "cloudinary/halfway-cafe/admin/image%2Fhttps%3A%2F%2Fevil.example",
    "cloudinary/halfway-cafe/admin\\image--uuid",
    "cloudinary/halfway-cafe/admin/image+evil--uuid",
    "cloudinary/halfway-cafe/admin/image--uuid\nhttps://evil.example",
  ];

  for (const reference of rejected) {
    assert.equal(parseCloudinaryReference(reference), null, reference);
  }
});

test("matches the approved Phase 8E SHA-256 signing vector", () => {
  assert.equal(
    signCloudinaryDeliveryPath(
      "c_limit,w_828/f_auto/q_auto/v1234/halfway-cafe/hero/hero1--a770d412c9c0.png",
      "test-secret",
    ),
    "1T99h5Wk",
  );
});

test("passes Supabase and Unsplash HTTPS inputs through byte-for-byte", async () => {
  const sources = [
    "https://project.supabase.co/storage/v1/object/sign/kids/nuggets.png?token=signed-token",
    "https://images.unsplash.com/photo-123?w=600&q=80",
  ];
  let lookups = 0;

  for (const source of sources) {
    const result = await resolvePublicMenuImageCore({
      source,
      role: "card",
      cloudName: "shared-cloud",
      apiSecret: "test-secret",
      lookup: async () => {
        lookups += 1;
        return null;
      },
    });

    assert.deepEqual(result, { kind: "legacy", source });
  }

  assert.equal(lookups, 0);
});

test("resolves ready registry metadata to the Phase 8E signed responsive lattice", async () => {
  const result = await resolvePublicMenuImageCore({
    source: `cloudinary/${FISH_PUBLIC_ID}`,
    role: "card",
    cloudName: "shared-cloud",
    apiSecret: "test-secret",
    lookup: async () => ({
      public_id: FISH_PUBLIC_ID,
      version: 1794081406,
      format: "jpeg",
      width: 452,
      height: 678,
    }),
  });

  assert.equal(result.kind, "cloudinary");
  assert.deepEqual(result.kind === "cloudinary" ? result.image?.widths : null, [
    96, 192, 256, 384, 452,
  ]);
  assert.match(
    result.kind === "cloudinary" ? result.image?.src ?? "" : "",
    /^https:\/\/res\.cloudinary\.com\/shared-cloud\/image\/upload\/s--[A-Za-z0-9_-]{8}--\/c_limit,w_452\/q_auto\/f_webp\/v1794081406\/halfway-cafe\/admin\/fish-finger--b9a2ddef-c333-441d-a40f-3f73b1afc52c\.jpeg$/,
  );
  assert.equal(JSON.stringify(result).includes("test-secret"), false);
  assert.equal(JSON.stringify(result).includes("/_next/image"), false);
});

test("consumes malformed Cloudinary candidates instead of treating them as legacy URLs", async () => {
  const diagnostics = [];
  const result = await resolvePublicMenuImageCore({
    source: "cloudinary/halfway-cafe/admin/../secret",
    role: "card",
    cloudName: "shared-cloud",
    apiSecret: "test-secret",
    lookup: async () => assert.fail("invalid references must not query the registry"),
    diagnostic: (event) => diagnostics.push(event),
  });

  assert.deepEqual(result, { kind: "cloudinary", image: null });
  assert.deepEqual(diagnostics, [{ stage: "invalid-reference" }]);
  assert.equal(JSON.stringify(diagnostics).includes("../secret"), false);
  assert.equal(JSON.stringify(diagnostics).includes("test-secret"), false);
});

test("missing registry rows and lookup failures return a safe Cloudinary placeholder", async () => {
  const diagnostics = [];
  const base = {
    source: `cloudinary/${FISH_PUBLIC_ID}`,
    role: "card",
    cloudName: "shared-cloud",
    apiSecret: "test-secret",
    diagnostic: (event) => diagnostics.push(event),
  };

  const missing = await resolvePublicMenuImageCore({ ...base, lookup: async () => null });
  const failed = await resolvePublicMenuImageCore({
    ...base,
    lookup: async () => {
      throw new Error("provider response containing secret material");
    },
  });

  assert.deepEqual(missing, { kind: "cloudinary", image: null });
  assert.deepEqual(failed, { kind: "cloudinary", image: null });
  assert.deepEqual(diagnostics, [
    { stage: "registry-missing", publicId: FISH_PUBLIC_ID },
    { stage: "registry-error", publicId: FISH_PUBLIC_ID },
  ]);
  assert.equal(JSON.stringify(diagnostics).includes("provider response"), false);
  assert.equal(JSON.stringify(diagnostics).includes("test-secret"), false);
});

test("missing server configuration fails closed before registry access", async () => {
  const diagnostics = [];
  const result = await resolvePublicMenuImageCore({
    source: `cloudinary/${FISH_PUBLIC_ID}`,
    role: "card",
    cloudName: "",
    apiSecret: "",
    lookup: async () => assert.fail("missing configuration must not query the registry"),
    diagnostic: (event) => diagnostics.push(event),
  });

  assert.deepEqual(result, { kind: "cloudinary", image: null });
  assert.deepEqual(diagnostics, [
    { stage: "configuration-missing", publicId: FISH_PUBLIC_ID },
  ]);
});

test("rejects registry metadata for a different public ID", async () => {
  const diagnostics = [];
  const result = await resolvePublicMenuImageCore({
    source: `cloudinary/${FISH_PUBLIC_ID}`,
    role: "card",
    cloudName: "shared-cloud",
    apiSecret: "test-secret",
    lookup: async () => ({
      public_id: "halfway-cafe/admin/different--uuid",
      version: 1,
      format: "jpeg",
      width: 452,
      height: 678,
    }),
    diagnostic: (event) => diagnostics.push(event),
  });

  assert.deepEqual(result, { kind: "cloudinary", image: null });
  assert.deepEqual(diagnostics, [{ stage: "registry-invalid", publicId: FISH_PUBLIC_ID }]);
});

test("item transformation preserves fields and order while removing logical references", async () => {
  const cloudinaryImage = {
    src: "https://res.cloudinary.com/demo/image/upload/s--signed--/fish.jpeg",
    srcSet: "https://res.cloudinary.com/demo/image/upload/s--signed--/fish.jpeg 452w",
    width: 452,
    height: 678,
    widths: [452],
    provider: "cloudinary",
  };
  const items = [
    { id: "legacy", name: "Chicken Nuggets", price: 5.9, image_url: "https://example.com/nuggets.png" },
    { id: "cloud", name: "Fish Fingers", price: 5.9, image_url: `cloudinary/${FISH_PUBLIC_ID}` },
    { id: "missing", name: "Missing", price: 1, image_url: "cloudinary/halfway-cafe/admin/missing--uuid" },
  ];
  const resolver = async (source) => {
    if (source?.includes("fish-finger")) return { kind: "cloudinary", image: cloudinaryImage };
    if (source?.startsWith("cloudinary/")) return { kind: "cloudinary", image: null };
    return source ? { kind: "legacy", source } : { kind: "none" };
  };

  const transformed = await Promise.all(
    items.map((item) => resolvePublicMenuItemImage(item, "image_url", "content", resolver)),
  );

  assert.deepEqual(transformed.map((item) => item.id), ["legacy", "cloud", "missing"]);
  assert.deepEqual(transformed.map((item) => [item.name, item.price]), [
    ["Chicken Nuggets", 5.9],
    ["Fish Fingers", 5.9],
    ["Missing", 1],
  ]);
  assert.equal(transformed[0].image_url, "https://example.com/nuggets.png");
  assert.equal(transformed[0].resolvedImage, undefined);
  assert.equal("image_url" in transformed[1], false);
  assert.deepEqual(transformed[1].resolvedImage, cloudinaryImage);
  assert.equal("image_url" in transformed[2], false);
  assert.equal(transformed[2].resolvedImage, null);
});
