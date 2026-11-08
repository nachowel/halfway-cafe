import test from "node:test";
import assert from "node:assert/strict";

import {
  buildQrMenuData,
  formatQrMenuPrice,
  getQrMenuPriceOptions,
  type QrMenuProduct,
} from "./qr-menu-data.ts";

const activeCategories = [
  { id: "drinks", name: "Drinks", slug: "drinks", sort_order: 10, active: true },
  { id: "breakfast", name: "Breakfast", slug: "breakfast", sort_order: 1, active: true },
  { id: "omelettes", name: "Omelettes", slug: "omelettes", sort_order: 2, active: true },
  { id: "pancakes", name: "Pancakes & Eggs", slug: "pancakes-eggs", sort_order: 3, active: true },
  { id: "sandwiches", name: "Sandwiches", slug: "sandwiches", sort_order: 4, active: true },
  { id: "burgers", name: "Burgers", slug: "burgers", sort_order: 5, active: true },
  { id: "jackets", name: "Jacket Potatoes", slug: "jacket-potatoes", sort_order: 6, active: true },
  { id: "lunch", name: "Lunch", slug: "lunch", sort_order: 7, active: true },
  { id: "panini", name: "Panini", slug: "panini", sort_order: 8, active: true },
  { id: "sides", name: "Sides & Extras", slug: "sides-extras", sort_order: 9, active: true },
  { id: "kids", name: "Kids Menu", slug: "kids-menu", sort_order: 11, active: true },
];

test("keeps every active category while filtering, deduplicating, and sorting active products", () => {
  const categories = [
    ...activeCategories,
    { id: "hidden", name: "Hidden", slug: "hidden", sort_order: 0, active: false },
  ];
  const products = [
    {
      id: "tea",
      name: "Tea",
      description: "Freshly brewed.",
      price: "2.50",
      price_roll: null,
      price_sandwich: null,
      price_baguette: null,
      category: "drinks",
      sort_order: 2,
      active: true,
    },
    {
      id: "coffee",
      name: "Coffee",
      description: "Fresh coffee.",
      price: 3,
      price_roll: null,
      price_sandwich: null,
      price_baguette: null,
      category: "drinks",
      sort_order: 1,
      active: true,
    },
    {
      id: "coffee",
      name: "Coffee duplicate",
      description: "Must not render twice.",
      price: 99,
      price_roll: null,
      price_sandwich: null,
      price_baguette: null,
      category: "drinks",
      sort_order: 3,
      active: true,
    },
    {
      id: "inactive",
      name: "Inactive item",
      description: "Must not be public.",
      price: 1,
      price_roll: null,
      price_sandwich: null,
      price_baguette: null,
      category: "breakfast",
      sort_order: 1,
      active: false,
    },
    {
      id: "hidden-category-item",
      name: "Hidden category item",
      description: "Must not be public.",
      price: 1,
      price_roll: null,
      price_sandwich: null,
      price_baguette: null,
      category: "hidden",
      sort_order: 1,
      active: true,
    },
  ];

  const menu = buildQrMenuData(categories, products);

  assert.equal(menu.length, 11);
  assert.deepEqual(
    menu.map((category) => category.slug),
    [
      "breakfast",
      "omelettes",
      "pancakes-eggs",
      "sandwiches",
      "burgers",
      "jacket-potatoes",
      "lunch",
      "panini",
      "sides-extras",
      "drinks",
      "kids-menu",
    ],
  );
  assert.deepEqual(
    menu.find((category) => category.slug === "drinks")?.products.map((product) => product.name),
    ["Coffee", "Tea"],
  );
  assert.equal(menu.flatMap((category) => category.products).length, 2);
});

test("uses explicit Roll, Sandwich, and Baguette prices instead of an unlabelled base price", () => {
  const sandwich: QrMenuProduct = {
    id: "bacon",
    name: "Bacon",
    description: "Freshly cooked bacon.",
    category: "sandwiches",
    sortOrder: 1,
    basePrice: 1.25,
    rollPrice: 2.2,
    sandwichPrice: 3,
    baguettePrice: 3.8,
  };

  assert.deepEqual(getQrMenuPriceOptions(sandwich), [
    { label: "Roll", value: 2.2 },
    { label: "Sandwich", value: 3 },
    { label: "Baguette", value: 3.8 },
  ]);
});

test("uses the base price for products without variants", () => {
  const tea: QrMenuProduct = {
    id: "tea",
    name: "Tea",
    description: "Freshly brewed.",
    category: "drinks",
    sortOrder: 1,
    basePrice: 2.5,
    rollPrice: null,
    sandwichPrice: null,
    baguettePrice: null,
  };

  assert.deepEqual(getQrMenuPriceOptions(tea), [{ label: null, value: 2.5 }]);
});

test("formats public prices consistently in pounds sterling", () => {
  assert.equal(formatQrMenuPrice(2), "£2.00");
  assert.equal(formatQrMenuPrice(3.8), "£3.80");
});

test("rejects invalid prices rather than displaying an invented fallback", () => {
  assert.throws(
    () =>
      buildQrMenuData(activeCategories, [
        {
          id: "broken",
          name: "Broken price",
          description: "",
          price: "not-a-price",
          price_roll: null,
          price_sandwich: null,
          price_baguette: null,
          category: "breakfast",
          sort_order: 1,
          active: true,
        },
      ]),
    /Invalid base price for menu item broken/,
  );
});

test("rejects a missing required price rather than displaying zero", () => {
  assert.throws(
    () =>
      buildQrMenuData(activeCategories, [
        {
          id: "missing-price",
          name: "Missing price",
          description: "",
          price: null,
          price_roll: null,
          price_sandwich: null,
          price_baguette: null,
          category: "breakfast",
          sort_order: 1,
          active: true,
        },
      ]),
    /Invalid base price for menu item missing-price/,
  );
});
