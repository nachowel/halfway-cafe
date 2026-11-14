import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

import { resolvePublicMenuImageCore } from "./public-menu-image-core.ts";
import { createRequestScopedRegistryLookup } from "./public-menu-image-registry-cache.ts";

const require = createRequire(import.meta.url);
const serverReact = require("next/dist/compiled/react");
// Keep the pinned Next 14 server-cache dispatcher access isolated here so a
// framework upgrade has one explicit compatibility point.
const reactInternals =
  serverReact.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

const FIRST_PUBLIC_ID = "halfway-cafe/admin/first--00000000-0000-0000-0000-000000000001";
const SECOND_PUBLIC_ID = "halfway-cafe/admin/second--00000000-0000-0000-0000-000000000002";
const BREAKFAST_PUBLIC_ID = "halfway-cafe/set-breakfast/set2--80c9fed3752e";
const BREAKFAST_FALLBACK =
  "https://example.supabase.co/storage/v1/object/public/set-breakfast/set2.png";

async function withServerRequestCache(callback) {
  const requestCache = new Map();
  const previousDispatcher = reactInternals.ReactCurrentCache.current;

  reactInternals.ReactCurrentCache.current = {
    getCacheForType(resourceType) {
      if (!requestCache.has(resourceType)) {
        requestCache.set(resourceType, resourceType());
      }
      return requestCache.get(resourceType);
    },
  };

  try {
    return await callback();
  } finally {
    reactInternals.ReactCurrentCache.current = previousDispatcher;
  }
}

test("repeated primitive publicId lookups share one registry load in a server request", async () => {
  await withServerRequestCache(async () => {
    let loads = 0;
    const load = async (publicId) => {
      loads += 1;
      return { public_id: publicId };
    };
    const lookup = createRequestScopedRegistryLookup(serverReact.cache, load);

    const [first, second] = await Promise.all([
      lookup(FIRST_PUBLIC_ID),
      lookup(FIRST_PUBLIC_ID),
    ]);

    assert.equal(loads, 1);
    assert.strictEqual(first, second);
  });
});

test("distinct primitive publicId lookups keep separate registry loads", async () => {
  await withServerRequestCache(async () => {
    let loads = 0;
    const lookup = createRequestScopedRegistryLookup(serverReact.cache, async (publicId) => {
      loads += 1;
      return { public_id: publicId };
    });

    const [first, second] = await Promise.all([
      lookup(FIRST_PUBLIC_ID),
      lookup(SECOND_PUBLIC_ID),
    ]);

    assert.equal(loads, 2);
    assert.equal(first.public_id, FIRST_PUBLIC_ID);
    assert.equal(second.public_id, SECOND_PUBLIC_ID);
  });
});

test("a module-level cached lookup starts fresh for the next server request", async () => {
  let loads = 0;
  const lookup = createRequestScopedRegistryLookup(serverReact.cache, async (publicId) => {
    loads += 1;
    return { public_id: publicId, loadNumber: loads };
  });

  await withServerRequestCache(async () => {
    const [first, repeated] = await Promise.all([
      lookup(FIRST_PUBLIC_ID),
      lookup(FIRST_PUBLIC_ID),
    ]);

    assert.equal(loads, 1);
    assert.strictEqual(first, repeated);
  });

  await withServerRequestCache(async () => {
    const [first, repeated] = await Promise.all([
      lookup(FIRST_PUBLIC_ID),
      lookup(FIRST_PUBLIC_ID),
    ]);

    assert.equal(loads, 2);
    assert.strictEqual(first, repeated);
    assert.equal(first.loadNumber, 2);
  });
});

test("shared registry metadata still produces role-specific desktop and mobile URLs", async () => {
  await withServerRequestCache(async () => {
    let loads = 0;
    const lookup = createRequestScopedRegistryLookup(serverReact.cache, async (publicId) => {
      loads += 1;
      return {
        public_id: publicId,
        version: 1792168037,
        format: "png",
        width: 1184,
        height: 896,
      };
    });
    const base = {
      source: `cloudinary/${BREAKFAST_PUBLIC_ID}`,
      cloudName: "shared-cloud",
      apiSecret: "test-secret",
      lookup,
    };

    const [desktop, mobile] = await Promise.all([
      resolvePublicMenuImageCore({ ...base, role: "card" }),
      resolvePublicMenuImageCore({ ...base, role: "content" }),
    ]);

    assert.equal(loads, 1);
    assert.equal(desktop.kind, "cloudinary");
    assert.equal(mobile.kind, "cloudinary");
    assert.match(desktop.kind === "cloudinary" ? desktop.image?.src ?? "" : "", /c_limit,w_828/);
    assert.match(mobile.kind === "cloudinary" ? mobile.image?.src ?? "" : "", /c_limit,w_1080/);
    assert.notEqual(
      desktop.kind === "cloudinary" ? desktop.image?.src : null,
      mobile.kind === "cloudinary" ? mobile.image?.src : null,
    );
  });
});

test("a deduplicated registry failure preserves the verified image fallback", async () => {
  await withServerRequestCache(async () => {
    let loads = 0;
    const lookup = createRequestScopedRegistryLookup(serverReact.cache, async () => {
      loads += 1;
      throw new Error("registry unavailable");
    });
    const resolve = () =>
      resolvePublicMenuImageCore({
        source: `cloudinary/${BREAKFAST_PUBLIC_ID}`,
        role: "content",
        cloudName: "shared-cloud",
        apiSecret: "test-secret",
        lookup,
        fallback: (publicId) =>
          publicId === BREAKFAST_PUBLIC_ID ? BREAKFAST_FALLBACK : null,
      });

    const [first, second] = await Promise.all([resolve(), resolve()]);

    assert.equal(loads, 1);
    assert.deepEqual(first, { kind: "legacy", source: BREAKFAST_FALLBACK });
    assert.deepEqual(second, { kind: "legacy", source: BREAKFAST_FALLBACK });
  });
});

test("a cached registry failure is retried successfully in the next request", async () => {
  let loads = 0;
  const lookup = createRequestScopedRegistryLookup(serverReact.cache, async (publicId) => {
    loads += 1;
    if (loads === 1) throw new Error("registry unavailable");
    return {
      public_id: publicId,
      version: 1792168037,
      format: "png",
      width: 1184,
      height: 896,
    };
  });
  const resolve = () =>
    resolvePublicMenuImageCore({
      source: `cloudinary/${BREAKFAST_PUBLIC_ID}`,
      role: "content",
      cloudName: "shared-cloud",
      apiSecret: "test-secret",
      lookup,
      fallback: () => BREAKFAST_FALLBACK,
    });

  await withServerRequestCache(async () => {
    const [first, repeated] = await Promise.all([resolve(), resolve()]);
    assert.equal(loads, 1);
    assert.deepEqual(first, { kind: "legacy", source: BREAKFAST_FALLBACK });
    assert.deepEqual(repeated, { kind: "legacy", source: BREAKFAST_FALLBACK });
  });

  await withServerRequestCache(async () => {
    const result = await resolve();
    assert.equal(loads, 2);
    assert.equal(result.kind, "cloudinary");
  });
});
