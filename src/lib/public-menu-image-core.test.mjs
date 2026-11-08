import assert from "node:assert/strict";
import { test } from "node:test";

import {
  parseCloudinaryReference,
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

test("passes legacy HTTPS input through byte-for-byte without a registry lookup", async () => {
  const source = "https://images.unsplash.com/photo-123?w=600&q=80";
  let lookups = 0;
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
