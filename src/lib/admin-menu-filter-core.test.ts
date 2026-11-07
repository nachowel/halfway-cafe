import assert from "node:assert/strict";
import test from "node:test";

import { filterAdminMenuItems } from "./admin-menu-filter-core.ts";

const rows = [
  { name: "Extra Bacon", description: "Crispy smoked rashers", price: 1.5, category: "extras", active: true, featured: false },
  { name: "Beans", description: "A breakfast side", price: 1.0, category: "extras", active: false, featured: true },
  { name: "Coffee", description: null, price: 2.5, category: "drinks", active: true, featured: true },
];

test("filters Production menu rows by name or description", () => {
  assert.deepEqual(filterAdminMenuItems(rows, { search: "bacon", category: "All", minPrice: "", maxPrice: "", onlyActive: false, onlyFeatured: false }), [rows[0]]);
  assert.deepEqual(filterAdminMenuItems(rows, { search: "smoked", category: "All", minPrice: "", maxPrice: "", onlyActive: false, onlyFeatured: false }), [rows[0]]);
});

test("preserves Production category, price, active, and featured filters", () => {
  assert.deepEqual(filterAdminMenuItems(rows, { search: "", category: "extras", minPrice: "1.25", maxPrice: "2", onlyActive: true, onlyFeatured: false }), [rows[0]]);
  assert.deepEqual(filterAdminMenuItems(rows, { search: "", category: "All", minPrice: "", maxPrice: "", onlyActive: false, onlyFeatured: true }), [rows[1], rows[2]]);
});

test("treats invalid or empty price bounds as unbounded", () => {
  assert.deepEqual(filterAdminMenuItems(rows, { search: "", category: "All", minPrice: "not-a-number", maxPrice: "", onlyActive: false, onlyFeatured: false }), rows);
});
