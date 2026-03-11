/* Halfway Cafe — Menu page */

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import MenuSection from "@/components/sections/MenuSection";
import { getMenuItems, getCategories } from "@/lib/queries";
import { menuItems as fallbackMenu } from "@/data/menu";
import type { MenuItem } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function toMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    category: row.category,
    image: row.image_url ?? undefined,
    allergens: [],
    dietary: row.dietary ?? [],
    available: row.active !== false,
    featured: row.featured ?? false,
  };
}

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Full English breakfasts, burgers, desserts & drinks — see the full Halfway Cafe menu with prices, allergen info and dietary tags.",
};

function SectionLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center bg-parchment">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
    </div>
  );
}

export default async function MenuPage() {
  const [dbMenu, dbCategories] = await Promise.all([
    getMenuItems(),
    getCategories(),
  ]);
  const menuItems: MenuItem[] =
    dbMenu.length > 0 ? dbMenu.map(toMenuItem) : fallbackMenu;
  const categories = dbCategories.length > 0
    ? dbCategories.map((c: any) => ({ slug: c.slug, name: c.name }))
    : [
        { slug: "breakfast", name: "Breakfast" },
        { slug: "lunch", name: "Lunch" },
        { slug: "burgers", name: "Burgers" },
        { slug: "desserts", name: "Desserts" },
        { slug: "drinks", name: "Drinks" },
      ];
  return (
    <>
      {/* Page hero */}
      <section className="bg-parchment-dark pb-12 pt-32">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 font-lora text-sm text-ink-light">
            <Link href="/" className="text-ink-light no-underline hover:text-red">
              Home
            </Link>
            <span className="mx-2">→</span>
            <span className="text-ink">Menu</span>
          </nav>

          <h1 className="font-playfair text-4xl font-bold text-ink md:text-5xl">
            Our Menu
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-lora text-base italic text-ink-light">
            Everything cooked fresh to order — from the full English to our
            famous burgers and proper puddings.
          </p>
        </div>
      </section>

      {/* Allergen banner */}
      <div className="border-l-4 border-red bg-parchment-dark px-4 py-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-lora text-sm italic text-ink-light">
            ⚠️ <strong className="font-bold not-italic">Allergen Information:</strong>{" "}
            We handle allergens in our kitchen. Please speak to a member of staff
            if you have any dietary requirements or allergies before ordering.
          </p>
        </div>
      </div>

      {/* Menu section */}
      <Suspense fallback={<SectionLoader />}>
        <MenuSection items={menuItems} categories={categories} />
      </Suspense>

      {/* Spacer before footer */}
      <div className="h-12 bg-parchment-dark" />
    </>
  );
}
