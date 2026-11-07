/* Admin Menu Items — list all items with filters & toggles */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { listAdminMenuItems, setAdminMenuFlag } from "@/app/admin/actions";
import { filterAdminMenuItems } from "@/lib/admin-menu-filter-core";
import type { AdminMenuItemRow } from "@/types/admin-data";

const categoryColors: Record<string, string> = {
  breakfast: "bg-amber-100 text-amber-800",
  lunch: "bg-green-100 text-green-800",
  burgers: "bg-red-100 text-red-800",
  desserts: "bg-pink-100 text-pink-800",
  drinks: "bg-blue-100 text-blue-800",
};

function formatCategoryLabel(category: string) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ToggleSwitch({
  checked,
  onClick,
  activeClassName,
}: {
  checked: boolean;
  onClick: () => void;
  activeClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? activeClassName : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<AdminMenuItemRow[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      setError("");
      setItems(await listAdminMenuItems());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load menu items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function toggleField(id: string, field: "active" | "featured", current: boolean) {
    const next = !current;
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: next } : item));
    try {
      setError("");
      await setAdminMenuFlag(id, field, next);
    } catch (e) {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: current } : item));
      setError(e instanceof Error ? e.message : `Unable to update ${field}`);
    }
  }

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
  );

  const filtered = useMemo(() => {
    return filterAdminMenuItems(items, {
      search,
      category: activeCategory,
      minPrice,
      maxPrice,
      onlyActive,
      onlyFeatured,
    });
  }, [items, search, activeCategory, minPrice, maxPrice, onlyActive, onlyFeatured]);

  const hasActiveFilters =
    search.trim() !== "" ||
    activeCategory !== "All" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    onlyActive ||
    onlyFeatured;

  function clearFilters() {
    setSearch("");
    setActiveCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setOnlyActive(false);
    setOnlyFeatured(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-playfair text-2xl font-bold text-neutral-900">
            Menu Items
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {loading
              ? "Loading items..."
              : hasActiveFilters
                ? `Showing ${filtered.length} of ${items.length} items`
                : `${items.length} items found`}
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline transition-colors hover:bg-accent-dark md:min-h-0"
        >
          + Add New Item
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Filters */}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <label
                htmlFor="menu-search"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-600"
              >
                Search
              </label>
              <input
                id="menu-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu items..."
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label
                htmlFor="min-price"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-600"
              >
                Min Price (£)
              </label>
              <input
                id="min-price"
                type="number"
                min="0"
                step="0.01"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label
                htmlFor="max-price"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-600"
              >
                Max Price (£)
              </label>
              <input
                id="max-price"
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="20.00"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center xl:gap-4">
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-accent focus:ring-accent"
              />
              Show only active
            </label>

            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={onlyFeatured}
                onChange={(e) => setOnlyFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-accent focus:ring-accent"
              />
              Show only featured
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-11 rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 sm:col-span-2 xl:col-span-1"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  activeCategory === category
                    ? "border-[#F97316] bg-[#F97316] text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {category === "All" ? category : formatCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center rounded-xl border border-neutral-200 bg-white py-16 shadow-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-neutral-200 bg-white px-5 py-12 text-center text-sm text-neutral-400 shadow-sm">
          No items found.
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-4 md:hidden">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {item.image.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image.preview.src}
                        srcSet={item.image.preview.srcSet}
                        alt={item.name}
                        sizes="64px"
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-2xl">
                        🍳
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-5 text-neutral-900">
                        {item.name}
                      </p>
                      <span className="shrink-0 text-sm font-bold text-accent">
                        £{Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          categoryColors[item.category] ?? "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {formatCategoryLabel(item.category)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-neutral-50 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Active
                      </span>
                      <ToggleSwitch
                        checked={item.active}
                        onClick={() => toggleField(item.id, "active", item.active)}
                        activeClassName="bg-accent"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-neutral-50 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Featured
                      </span>
                      <ToggleSwitch
                        checked={item.featured}
                        onClick={() => toggleField(item.id, "featured", item.featured)}
                        activeClassName="bg-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/admin/menu/${item.id}`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 no-underline transition-colors hover:border-accent hover:text-accent"
                  >
                    Edit Item
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 hidden overflow-hidden rounded-xl border border-neutral-200 border-t-4 border-t-accent bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="w-14 px-4 py-3" />
                  <th className="px-4 py-3 font-medium text-neutral-600">Name</th>
                  <th className="px-4 py-3 font-medium text-neutral-600">Category</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-600">Price</th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-600">Active</th>
                  <th className="px-4 py-3 text-center font-medium text-neutral-600">Featured</th>
                  <th className="px-4 py-3 font-medium text-neutral-600" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-neutral-50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-sm bg-neutral-100">
                        {item.image.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image.preview.src}
                            srcSet={item.image.preview.srcSet}
                            alt={item.name}
                            sizes="40px"
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-lg">
                            🍳
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {item.name}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium capitalize ${
                          categoryColors[item.category] ?? "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {formatCategoryLabel(item.category)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-neutral-700">
                      £{Number(item.price).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <ToggleSwitch
                        checked={item.active}
                        onClick={() => toggleField(item.id, "active", item.active)}
                        activeClassName="bg-accent"
                      />
                    </td>

                    <td className="px-4 py-3 text-center">
                      <ToggleSwitch
                        checked={item.featured}
                        onClick={() => toggleField(item.id, "featured", item.featured)}
                        activeClassName="bg-amber-500"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/menu/${item.id}`}
                        className="text-xs font-medium text-accent no-underline hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
