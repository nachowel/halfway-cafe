import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryMenuContent from "@/components/menu/CategoryMenuContent";
import CategoryHero from "@/components/sections/CategoryHero";
import { menuItems as fallbackMenu } from "@/data/menu";
import { menuCategoryDefinitions } from "@/data/menuCategories";
import { BREAKFAST_HERO_IMAGE_URL } from "@/lib/storage";
import { resolveMenuItemForDisplay } from "@/lib/public-menu-images.server";
import { markPublicDataUncacheable } from "@/lib/public-cache";
import { createPublicServerClient } from "@/lib/supabase-public";
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

const paniniSeoBlock = (
  <div className="mb-10 space-y-6">
    <div className="prose prose-sm max-w-none font-inter text-base leading-7 text-ink-light">
      <h3 className="font-playfair text-xl font-bold text-ink">Quick Lunch in Sidcup</h3>
      <p>
        If you&apos;re looking for a quick lunch in Sidcup that&apos;s hot, simple, and ready fast,
        a panini is one of the easiest choices on the menu.
      </p>
      <ul className="mt-2 space-y-1 pl-0 list-none">
        <li>
          👉{" "}
          <Link href="/menu" className="text-accent underline hover:text-accent/80">
            View full menu
          </Link>
        </li>
        <li>
          👉{" "}
          <Link href="/menu/drinks" className="text-accent underline hover:text-accent/80">
            Grab a drink with your panini
          </Link>
        </li>
        <li>
          👉{" "}
          <Link href="/menu/lunch" className="text-accent underline hover:text-accent/80">
            See more lunch options
          </Link>
        </li>
      </ul>
    </div>
  </div>
);

const kidsMenuSeoBlock = (
  <div className="mb-10 space-y-6">
    <div className="prose prose-sm max-w-none font-inter text-base leading-7 text-ink-light">
      <p>
        Bringing kids to a cafe should be easy. At Halfway Cafe in Sidcup, the kids menu is built
        around the kind of food children actually want — simple plates, familiar flavours, and
        portions sized right for smaller appetites. There&apos;s no fuss, no long wait, and no need
        to book ahead. Just walk in, grab a table, and let us handle the rest. Whether you&apos;re
        stopping by on a weekend morning or squeezing in lunch mid-week, families are always welcome
        here on Halfway Street.
      </p>
      <p>
        Halfway Cafe is a proper local{" "}
        <Link href="/cafe-sidcup" className="text-accent underline hover:text-accent/80">
          cafe in the DA15 area
        </Link>
        , and that means it suits families just as well as it suits the early-morning regulars.
        Service is quick — important when you have hungry kids at the table — and the relaxed,
        no-frills atmosphere means little ones can settle in without any pressure. If you&apos;re
        looking for a straightforward family lunch or a casual breakfast out in Sidcup, we&apos;re
        open Monday to Saturday from 7am, and Sundays from 9am. Browse the{" "}
        <Link href="/menu" className="text-accent underline hover:text-accent/80">
          full menu
        </Link>{" "}
        to see everything on offer.
      </p>
    </div>
  </div>
);

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
    const supabase = createPublicServerClient();

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
    markPublicDataUncacheable("getMenuCategoryData", error);

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
  const resolvedItems = await Promise.all(
    items.map((item) => resolveMenuItemForDisplay(item, "image", "card")),
  );
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

        {categorySlug === "kids-menu" && kidsMenuSeoBlock}
        {categorySlug === "panini" && paniniSeoBlock}

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
            items={resolvedItems}
            headingLevel={categorySlug === "breakfast" ? "h2" : "h1"}
          />
        </div>
      </div>
    </section>
  );
}
