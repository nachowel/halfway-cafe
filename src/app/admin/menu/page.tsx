/* Admin Menu Items — list all items with filters & toggles */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase";

interface DbMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  dietary: string[];
  available: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
}

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

export default function AdminMenuPage() {
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const supabase = createClientComponentClient();
      const query = supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      setItems((data as DbMenuItem[]) ?? []);
    } catch (e) {
      console.error("Failed to fetch menu items:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function toggleField(id: string, field: "active" | "featured", current: boolean) {
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase
        .from("menu_items")
        .update({ [field]: !current })
        .eq("id", id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: !current } : item
        )
      );
    } catch (e) {
      console.error(`Failed to toggle ${field}:`, e);
    }
  }

  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items]
  );

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const parsedMinPrice = minPrice === "" ? null : parseFloat(minPrice);
    const parsedMaxPrice = maxPrice === "" ? null : parseFloat(maxPrice);

    return items.filter((item) => {
      const itemPrice = Number(item.price);
      const matchSearch = item.name.toLowerCase().includes(normalizedSearch);
      const matchCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchMin =
        parsedMinPrice === null || Number.isNaN(parsedMinPrice)
          ? true
          : itemPrice >= parsedMinPrice;
      const matchMax =
        parsedMaxPrice === null || Number.isNaN(parsedMaxPrice)
          ? true
          : itemPrice <= parsedMaxPrice;
      const matchActive = !onlyActive || item.active;
      const matchFeatured = !onlyFeatured || item.featured;

      return (
        matchSearch &&
        matchCategory &&
        matchMin &&
        matchMax &&
        matchActive &&
        matchFeatured
      );
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
      <div className="flex items-center justify-between">
        <div>
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
          className="rounded-xl bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline transition-colors hover:bg-accent-dark"
        >
          + Add New Item
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-accent focus:ring-accent"
              />
              Show only active
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-700">
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
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto whitespace-nowrap">
          <div className="flex min-w-max gap-2 pb-1">
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

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 border-t-4 border-t-accent bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-neutral-400">
            No items found.
          </p>
        ) : (
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
                  {/* Image */}
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-sm bg-neutral-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg">
                          🍳
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {item.name}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium capitalize ${
                        categoryColors[item.category] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {formatCategoryLabel(item.category)}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right text-neutral-700">
                    £{Number(item.price).toFixed(2)}
                  </td>

                  {/* Active toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleField(item.id, "active", item.active)}
                      className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.active ? "bg-accent" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          item.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Featured toggle */}
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleField(item.id, "featured", item.featured)}
                      className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.featured ? "bg-amber-500" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          item.featured ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Edit */}
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
        )}
      </div>
    </div>
  );
}
