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
    };
  }

  return {
    title: `${activeCategory.name} Menu`,
    description: `Browse Halfway Cafe's ${activeCategory.name.toLowerCase()} menu with fresh daily dishes, prices, and dietary tags.`,
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
