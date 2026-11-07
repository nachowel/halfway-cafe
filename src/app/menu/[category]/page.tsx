import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPageSwitcher from "@/components/CategoryPageSwitcher";
import DesktopCategoryPage from "@/components/DesktopCategoryPage";
import MobileCategoryPageServer from "@/components/MobileCategoryPageServer";
import { menuCategoryDefinitions } from "@/data/menuCategories";
import { createServerComponentClient } from "@/lib/supabase-server";

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
}

interface PageProps {
  params: Promise<{
    category: string;
  }>;
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
  const { category } = await params;
  const activeCategory = await getActiveCategory(category);

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

  if (activeCategory.slug === "kids-menu") {
    return {
      title: "Kids Menu in Sidcup | Family-Friendly Cafe | Halfway Cafe",
      description:
        "Looking for a family-friendly cafe in Sidcup? Halfway Cafe's kids menu offers simple, familiar plates for children — quick service, no booking needed, walk-ins welcome.",
      alternates: {
        canonical: "/menu/kids-menu",
      },
      openGraph: {
        title: "Kids Menu in Sidcup | Family-Friendly Cafe | Halfway Cafe",
        description:
          "Simple meals for children at Halfway Cafe in Sidcup DA15. Walk in, no booking needed — quick, relaxed dining for families.",
        url: "/menu/kids-menu",
        images: [
          {
            url: "https://halfwaycafe.co.uk/og-image.jpg",
            width: 1200,
            height: 630,
            alt: "Kids Menu at Halfway Cafe — Family-Friendly Cafe in Sidcup DA15",
          },
        ],
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
  const { category: categorySlug } = await params;
  const { categories } = await getMenuCategoryData();
  const activeCategory = categories.find((category) => category.slug === categorySlug);

  if (!activeCategory) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://halfwaycafe.co.uk",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Menu",
        item: "https://halfwaycafe.co.uk/menu",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: activeCategory.name,
        item: `https://halfwaycafe.co.uk/menu/${activeCategory.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPageSwitcher
        desktopCategory={<DesktopCategoryPage categorySlug={categorySlug} />}
        mobileCategory={<MobileCategoryPageServer categorySlug={categorySlug} />}
      />
    </>
  );
}
