import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPageSwitcher from "@/components/CategoryPageSwitcher";
import DesktopCategoryPage from "@/components/DesktopCategoryPage";
import { menuCategoryDefinitions } from "@/data/menuCategories";
import { createServerComponentClient } from "@/lib/supabase-server";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
}

interface PageProps {
  params: {
    category: string;
  };
}

async function getMenuCategoryData() {
  try {
    const supabase = await createServerComponentClient();

    if (!supabase) {
      throw new Error("Supabase env is not configured.");
    }

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }

    return {
      categories: data ?? [],
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
    };
  }
}

async function getActiveCategory(categorySlug: string) {
  const { categories } = await getMenuCategoryData();
  return categories.find((category) => category.slug === categorySlug) ?? null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const activeCategory = await getActiveCategory(params.category);

  if (!activeCategory) {
    return {
      title: "Menu",
      description: "Browse the Halfway Cafe menu by category.",
      alternates: {
        canonical: "/menu",
      },
      openGraph: {
        title: "Our Menu | Halfway Cafe Sidcup",
        description: "Browse the full Halfway Cafe menu — breakfasts, burgers, sandwiches and more.",
        url: "/menu",
      },
    };
  }

  return {
    title: `${activeCategory.name} Menu`,
    description: `Browse Halfway Cafe's ${activeCategory.name.toLowerCase()} menu — freshly made dishes served daily in Sidcup DA15. Full prices and dietary info included.`,
    alternates: {
      canonical: `/menu/${activeCategory.slug}`,
    },
    openGraph: {
      title: `${activeCategory.name} Menu | Halfway Cafe Sidcup`,
      description: `Browse Halfway Cafe's ${activeCategory.name.toLowerCase()} menu — freshly made dishes served daily in Sidcup DA15.`,
      url: `/menu/${activeCategory.slug}`,
      images: [
        {
          url: "https://halfwaycafe.co.uk/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Halfway Cafe ${activeCategory.name} Menu — Sidcup DA15`,
        },
      ],
    },
  };
}

export default async function MenuCategoryPage({ params }: PageProps) {
  const { categories } = await getMenuCategoryData();
  const activeCategory = categories.find((category) => category.slug === params.category);

  if (!activeCategory) {
    notFound();
  }

  return (
    <CategoryPageSwitcher
      categorySlug={params.category}
      desktopCategory={<DesktopCategoryPage categorySlug={params.category} />}
    />
  );
}
