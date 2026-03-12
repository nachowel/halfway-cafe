/* Admin Dashboard — stats overview + recent items */

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { createServerComponentClient } from "@/lib/supabase-server";

async function getStats() {
  try {
    const supabase = await createServerComponentClient();

    const [totalRes, activeRes, featuredRes, categoriesRes, recentRes] =
      await Promise.all([
        supabase.from("menu_items").select("id", { count: "exact", head: true }),
        supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("featured", true),
        supabase.from("menu_items").select("category").eq("active", true),
        supabase
          .from("menu_items")
          .select("id, name, category, price, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    const uniqueCategories = new Set(
      (categoriesRes.data ?? []).map((r) => r.category)
    );

    return {
      total: totalRes.count ?? 0,
      active: activeRes.count ?? 0,
      featured: featuredRes.count ?? 0,
      categories: uniqueCategories.size,
      recent: recentRes.data ?? [],
    };
  } catch (e) {
    console.error("Dashboard getStats:", e);
    return { total: 0, active: 0, featured: 0, categories: 0, recent: [] };
  }
}

const statCards = [
  { key: "total" as const, icon: "📋", label: "Total Menu Items" },
  { key: "active" as const, icon: "✅", label: "Active Items" },
  { key: "featured" as const, icon: "⭐", label: "Featured Items" },
  { key: "categories" as const, icon: "📂", label: "Menu Categories" },
];

const categoryColors: Record<string, string> = {
  breakfast: "bg-amber-100 text-amber-800",
  lunch: "bg-green-100 text-green-800",
  burgers: "bg-red-100 text-red-800",
  desserts: "bg-pink-100 text-pink-800",
  drinks: "bg-blue-100 text-blue-800",
};

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      {/* Header */}
      <h1 className="font-playfair text-2xl font-bold text-neutral-900">
        Good morning, welcome back
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Here&apos;s what&apos;s happening with your cafe.
      </p>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
          >
            <div className="h-1 bg-accent" />
            <div className="p-5">
              <span className="text-2xl">{card.icon}</span>
              <p className="mt-3 font-playfair text-3xl font-bold text-neutral-900">
                {stats[card.key]}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent items */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-playfair text-lg font-bold text-neutral-900">
            Recently Added
          </h2>
          <Link
            href="/admin/menu"
            className="text-sm text-accent no-underline hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-sm border border-neutral-200 bg-white">
          {stats.recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">
              No menu items found. Connect Supabase and run the seed SQL.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-5 py-3 font-medium text-neutral-600">Name</th>
                  <th className="px-5 py-3 font-medium text-neutral-600">Category</th>
                  <th className="px-5 py-3 text-right font-medium text-neutral-600">Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b border-neutral-50 last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-neutral-900">
                      {item.name}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-sm px-2 py-0.5 text-xs font-medium capitalize ${
                          categoryColors[item.category] ?? "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-700">
                      £{Number(item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
