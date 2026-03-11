/* Admin Menu Items — list all items with filters & toggles */

"use client";

import { useEffect, useState, useCallback } from "react";
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

const categories = ["all", "breakfast", "lunch", "burgers", "desserts", "drinks"];

const categoryColors: Record<string, string> = {
  breakfast: "bg-amber-100 text-amber-800",
  lunch: "bg-green-100 text-green-800",
  burgers: "bg-red-100 text-red-800",
  desserts: "bg-pink-100 text-pink-800",
  drinks: "bg-blue-100 text-blue-800",
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [filter, setFilter] = useState("all");
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

  const filtered =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-neutral-900">
            Menu Items
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {items.length} items total
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="rounded-sm bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white no-underline transition-colors hover:bg-red-700"
        >
          + Add New Item
        </Link>
      </div>

      {/* Category filter */}
      <div className="mt-6 flex gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-sm px-4 py-2 text-xs font-medium capitalize transition-colors ${
              filter === cat
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-sm border border-neutral-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
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
                      {item.category}
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
                        item.active ? "bg-green-500" : "bg-neutral-300"
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
                      className="text-xs font-medium text-red-600 no-underline hover:underline"
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
