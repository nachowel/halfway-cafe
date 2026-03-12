/* Admin Dashboard — overview cards, quick actions, and recent menu items */

/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { createServerComponentClient } from "@/lib/supabase-server";

async function getStats() {
  try {
    const supabase = await createServerComponentClient();

    const [totalRes, activeRes, featuredRes, categoriesRes, recentRes] =
      await Promise.all([
        supabase.from("menu_items").select("id", { count: "exact", head: true }),
        supabase
          .from("menu_items")
          .select("id", { count: "exact", head: true })
          .eq("active", true),
        supabase
          .from("menu_items")
          .select("id", { count: "exact", head: true })
          .eq("featured", true),
        supabase.from("menu_items").select("category").eq("active", true),
        supabase
          .from("menu_items")
          .select("id, name, category, price, active, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    const uniqueCategories = new Set(
      (categoriesRes.data ?? []).map((row) => row.category)
    );

    return {
      total: totalRes.count ?? 0,
      active: activeRes.count ?? 0,
      featured: featuredRes.count ?? 0,
      categories: uniqueCategories.size,
      recent: recentRes.data ?? [],
    };
  } catch (error) {
    console.error("Dashboard getStats:", error);
    return { total: 0, active: 0, featured: 0, categories: 0, recent: [] };
  }
}

const statCards = [
  {
    key: "total" as const,
    icon: "🍽️",
    label: "Total Items",
    iconClass: "bg-violet-100 text-violet-700",
    href: "/admin/menu",
  },
  {
    key: "active" as const,
    icon: "✅",
    label: "Active Items",
    iconClass: "bg-emerald-100 text-emerald-700",
    href: "/admin/menu",
  },
  {
    key: "featured" as const,
    icon: "⭐",
    label: "Featured Items",
    iconClass: "bg-amber-100 text-amber-700",
    href: "/admin/menu",
  },
  {
    key: "categories" as const,
    icon: "🏷️",
    label: "Categories",
    iconClass: "bg-orange-100 text-orange-600",
    href: "/admin/categories",
  },
];

const quickLinks = [
  {
    href: "/admin/menu/new",
    label: "+ Add Menu Item",
    className:
      "bg-accent text-white hover:bg-accent-dark border-accent",
  },
  {
    href: "/admin/categories",
    label: "Manage Categories",
    className:
      "border-border bg-white text-neutral-700 hover:border-accent hover:text-accent",
  },
  {
    href: "/admin/opening-hours",
    label: "Opening Hours",
    className:
      "border-border bg-white text-neutral-700 hover:border-accent hover:text-accent",
  },
];

const categoryColors: Record<string, string> = {
  breakfast: "bg-amber-100 text-amber-800",
  omelettes: "bg-lime-100 text-lime-800",
  "pancakes-eggs": "bg-rose-100 text-rose-800",
  lunch: "bg-green-100 text-green-800",
  sandwiches: "bg-orange-100 text-orange-800",
  burgers: "bg-red-100 text-red-800",
  "jacket-potatoes": "bg-stone-100 text-stone-800",
  panini: "bg-sky-100 text-sky-800",
  extras: "bg-purple-100 text-purple-800",
  drinks: "bg-blue-100 text-blue-800",
};

function formatDashboardDate() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date());
}

export default async function DashboardPage() {
  const stats = await getStats();
  const todayLabel = formatDashboardDate();

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Welcome back — here&apos;s what&apos;s happening at Halfway Cafe today.
            </p>
          </div>
          <p className="text-sm font-medium text-neutral-500">{todayLabel}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
            >
              <div className="flex items-center gap-4 px-5 py-5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl ${card.iconClass}`}
                >
                  {card.icon}
                </div>
                <div>
                  <p className="text-3xl font-bold text-neutral-900">
                    {stats[card.key]}
                  </p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
              <div className="border-t border-neutral-100 px-5 py-3">
                <Link
                  href={card.href}
                  className="text-sm font-medium text-accent no-underline hover:underline"
                >
                  View all →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl border px-5 py-3 text-sm font-medium no-underline transition-colors ${link.className}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-neutral-900">Recently Added</h2>
            <Link
              href="/admin/menu"
              className="text-sm font-medium text-accent no-underline hover:underline"
            >
              View all →
            </Link>
          </div>

          {stats.recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-neutral-400">
              No menu items found. Connect Supabase and run the seed SQL.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-6 py-3 font-medium text-neutral-600">Name</th>
                  <th className="px-6 py-3 font-medium text-neutral-600">Category</th>
                  <th className="px-6 py-3 text-right font-medium text-neutral-600">Price</th>
                  <th className="px-6 py-3 text-right font-medium text-neutral-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-t border-neutral-100 last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          categoryColors[item.category] ?? "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-neutral-700">
                      £{Number(item.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </span>
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
