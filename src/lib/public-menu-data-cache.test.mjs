import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

import { createRequestScopedMenuDataLoader } from "./public-menu-data-cache.ts";

const require = createRequire(import.meta.url);
const serverReact = require("next/dist/compiled/react");
const reactInternals =
  serverReact.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

const CATEGORIES = [
  { id: "breakfast", name: "Breakfast", slug: "breakfast", image_url: null },
  { id: "kids-menu", name: "Kids Menu", slug: "kids-menu", image_url: null },
];
const BREAKFAST_ITEMS = [
  {
    id: "set-one",
    name: "Set Breakfast 1",
    description: "Egg, bacon, sausage, beans",
    price: 8.5,
    category: "breakfast",
    sort_order: 1,
  },
  {
    id: "set-two",
    name: "Set Breakfast 2",
    description: "Egg, bacon, sausage, chips",
    price: 8.9,
    category: "breakfast",
    sort_order: 2,
  },
];
const KIDS_ITEMS = [
  {
    id: "kids-one",
    name: "Kids Breakfast",
    description: "Egg, sausage and beans",
    price: 5.9,
    category: "kids-menu",
    sort_order: 1,
  },
];

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

test("same-request category, item, and count reads execute each loader once", async () => {
  await withServerRequestCache(async () => {
    let categoryReads = 0;
    let itemReads = 0;
    let countReads = 0;
    const categories = createRequestScopedMenuDataLoader(serverReact.cache, async () => {
      categoryReads += 1;
      return CATEGORIES;
    });
    const items = createRequestScopedMenuDataLoader(serverReact.cache, async (slug) => {
      itemReads += 1;
      return slug === "breakfast" ? BREAKFAST_ITEMS : KIDS_ITEMS;
    });
    const counts = createRequestScopedMenuDataLoader(serverReact.cache, async () => {
      countReads += 1;
      return [{ id: "set-one", category: "breakfast" }];
    });

    const [firstCategories, repeatedCategories, firstItems, repeatedItems] =
      await Promise.all([
        categories(),
        categories(),
        items("breakfast"),
        items("breakfast"),
        counts(),
        counts(),
      ]);

    assert.equal(categoryReads, 1);
    assert.equal(itemReads, 1);
    assert.equal(countReads, 1);
    assert.strictEqual(firstCategories, repeatedCategories);
    assert.strictEqual(firstItems, repeatedItems);
  });
});

test("primitive category keys stay separate without changing row data or order", async () => {
  await withServerRequestCache(async () => {
    let reads = 0;
    const items = createRequestScopedMenuDataLoader(serverReact.cache, async (slug) => {
      reads += 1;
      return slug === "breakfast" ? BREAKFAST_ITEMS : KIDS_ITEMS;
    });

    const [breakfast, kids] = await Promise.all([
      items("breakfast"),
      items("kids-menu"),
    ]);

    assert.equal(reads, 2);
    assert.deepEqual(breakfast, BREAKFAST_ITEMS);
    assert.deepEqual(kids, KIDS_ITEMS);
    assert.deepEqual(
      breakfast.map(({ name, description, price, sort_order }) => ({
        name,
        description,
        price,
        sort_order,
      })),
      [
        {
          name: "Set Breakfast 1",
          description: "Egg, bacon, sausage, beans",
          price: 8.5,
          sort_order: 1,
        },
        {
          name: "Set Breakfast 2",
          description: "Egg, bacon, sausage, chips",
          price: 8.9,
          sort_order: 2,
        },
      ],
    );
  });
});

test("a module-level menu loader starts fresh in the next server request", async () => {
  let reads = 0;
  const categories = createRequestScopedMenuDataLoader(serverReact.cache, async () => {
    reads += 1;
    return CATEGORIES;
  });

  await withServerRequestCache(async () => {
    await Promise.all([categories(), categories()]);
    assert.equal(reads, 1);
  });

  await withServerRequestCache(async () => {
    await Promise.all([categories(), categories()]);
    assert.equal(reads, 2);
  });
});

test("a shared rejection keeps consumer fallbacks independent and retries next request", async () => {
  let reads = 0;
  const categories = createRequestScopedMenuDataLoader(serverReact.cache, async () => {
    reads += 1;
    if (reads === 1) throw new Error("categories unavailable");
    return CATEGORIES;
  });
  const staticFallback = [
    { id: "fallback", name: "Fallback", slug: "fallback", image_url: null },
  ];

  await withServerRequestCache(async () => {
    const [metadataCategories, mobileCategories] = await Promise.all([
      categories().catch(() => staticFallback),
      categories().catch(() => []),
    ]);

    assert.equal(reads, 1);
    assert.deepEqual(metadataCategories, staticFallback);
    assert.deepEqual(mobileCategories, []);
  });

  await withServerRequestCache(async () => {
    assert.deepEqual(await categories(), CATEGORIES);
    assert.equal(reads, 2);
  });
});
