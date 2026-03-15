import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryMenuContent from "@/components/menu/CategoryMenuContent";
import CategoryHero from "@/components/sections/CategoryHero";
import { menuItems as fallbackMenu } from "@/data/menu";
import { menuCategoryDefinitions } from "@/data/menuCategories";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";
import { createServerComponentClient } from "@/lib/supabase-server";
import type { MenuItem } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
}

const breakfastHero = {
  imageUrl: BREAKFAST_HERO_IMAGE_URL,
  label: "THE BREAKFAST MENU",
  title: "Proper Breakfast",
  subtitle: "Classic cafe breakfasts made fresh every morning.",
  info: "Breakfast served daily · 176 Halfway St, Sidcup",
};

function toMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    price_roll: row.price_roll ?? null,
    price_sandwich: row.price_sandwich ?? null,
    price_baguette: row.price_baguette ?? null,
    category: row.category,
    image: row.image_url ?? undefined,
    allergens: [],
    dietary: row.dietary ?? [],
    available: row.active !== false,
    featured: row.featured ?? false,
  };
}

function formatCategoryLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getMenuCategoryData(categorySlug: string) {
  try {
    const supabase = await createServerComponentClient();

    if (!supabase) {
      throw new Error("Supabase env is not configured.");
    }

    const [categoriesRes, menuItemsRes, countsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select("*")
        .eq("active", true)
        .eq("category", categorySlug)
        .order("sort_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select("id, category")
        .eq("active", true),
    ]);

    if (categoriesRes.error) {
      throw categoriesRes.error;
    }

    if (menuItemsRes.error) {
      throw menuItemsRes.error;
    }

    if (countsRes.error) {
      throw countsRes.error;
    }

    return {
      categories: categoriesRes.data ?? [],
      items: (menuItemsRes.data ?? []).map(toMenuItem),
      countRows: countsRes.data ?? [],
    };
  } catch (error) {
    console.error("getMenuCategoryData:", error);

    const fallbackCategories: CategoryRecord[] = menuCategoryDefinitions.map(
      (category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
      })
    );

    return {
      categories: fallbackCategories,
      items: fallbackMenu.filter((item) => item.category === categorySlug),
      countRows: fallbackMenu.map((item) => ({ id: item.id, category: item.category })),
    };
  }
}

export default async function DesktopCategoryPage({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const { categories, items, countRows } = await getMenuCategoryData(categorySlug);
  const activeCategory = categories.find((category) => category.slug === categorySlug);

  if (!activeCategory) {
    notFound();
  }

  const itemCounts = countRows.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.category] = (accumulator[row.category] ?? 0) + 1;
    return accumulator;
  }, {});

  const breadcrumb = (
    <nav className="mb-8 font-lora text-sm text-ink-light">
      <Link href="/" className="text-ink-light no-underline hover:text-accent">
        Home
      </Link>
      <span className="mx-2">→</span>
      <Link href="/menu" className="text-ink-light no-underline hover:text-accent">
        Menu
      </Link>
      <span className="mx-2">→</span>
      <span className="text-ink">{activeCategory.name}</span>
    </nav>
  );

  return (
    <section className="min-h-screen bg-parchment pb-16 pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {categorySlug === "breakfast" && (
          <div className="mb-8">
            <CategoryHero {...breakfastHero} />
          </div>
        )}

        {breadcrumb}

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <aside className="lg:w-64 lg:shrink-0">
            <div className="border border-border bg-white p-5 lg:sticky lg:top-24">
              <h2 className="font-playfair text-3xl font-bold text-ink">Menu</h2>

              <div className="mt-5 space-y-2">
                {categories.map((category) => {
                  const isActive = category.slug === categorySlug;
                  const itemCount = itemCounts[category.slug] ?? 0;

                  return (
                    <Link
                      key={category.id}
                      href={`/menu/${category.slug}`}
                      className={`flex items-center justify-between px-4 py-3 font-lora text-sm no-underline transition-colors duration-200 ${
                        isActive
                          ? "bg-accent text-white"
                          : "text-ink hover:bg-parchment-dark"
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className={isActive ? "text-white/70" : "text-ink-light"}>
                        {itemCount}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          <CategoryMenuContent
            categoryName={activeCategory.name ?? formatCategoryLabel(categorySlug)}
            items={items}
          />
        </div>
      </div>
    </section>
  );
}
