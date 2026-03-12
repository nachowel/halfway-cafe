/* Halfway Cafe — Public menu page with sticky category navigation */

import type { Metadata } from "next";
import Link from "next/link";
import MenuCategoryNav from "@/components/menu/MenuCategoryNav";
import MenuCategorySection from "@/components/menu/MenuCategorySection";
import {
  getMenuCategoryDefinitionBySlug,
  menuCategoryDefinitions,
  type MenuCategoryDefinition,
} from "@/data/menuCategories";
import { getCategories } from "@/lib/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const metadata: Metadata = {
  title: "Menu | Halfway Cafe",
  description:
    "Explore the Halfway Cafe menu including breakfast, omelettes, burgers, sandwiches, drinks and more.",
};

function buildMenuCategories(dbCategories: any[]): MenuCategoryDefinition[] {
  const dbCategoryMap = new Map(
    dbCategories.map((category) => [category.slug, category])
  );

  const mergedCategories = menuCategoryDefinitions.map((category) => {
    const dbCategory = dbCategoryMap.get(category.slug);

    return {
      id: dbCategory?.id ?? category.id,
      name: dbCategory?.name ?? category.name,
      slug: category.slug,
      description:
        getMenuCategoryDefinitionBySlug(category.slug)?.description ??
        category.description,
    };
  });

  return mergedCategories;
}

export default async function MenuPage() {
  const dbCategories = await getCategories();
  const categories = buildMenuCategories(dbCategories);

  return (
    <>
      <section className="bg-bg-soft pb-10 pt-28 md:pt-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <nav className="mb-6 font-inter text-sm text-text-mid">
            <Link href="/" className="text-text-mid no-underline hover:text-accent">
              Home
            </Link>
            <span className="mx-2">→</span>
            <span className="text-text">Menu</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-playfair text-4xl font-bold text-text md:text-5xl">
              Our Menu
            </h1>
            <p className="mt-4 font-inter text-base leading-7 text-text-mid md:text-lg">
              Explore the full Halfway Cafe menu by category. The structure is
              in place and each section is ready for dishes to be added next.
            </p>
          </div>
        </div>
      </section>

      <MenuCategoryNav categories={categories} />

      <section className="bg-white py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="rounded-3xl border border-border bg-white px-5 py-2 shadow-sm md:px-8">
            {categories.map((category) => (
              <MenuCategorySection key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
