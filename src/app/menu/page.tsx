/* Halfway Cafe — Menu landing page */

import type { Metadata } from "next";
import Link from "next/link";
import CategoriesSection from "@/components/sections/CategoriesSection";
import { getCategories } from "@/lib/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const metadata: Metadata = {
  title: "Menu | Halfway Cafe",
  description:
    "Browse the Halfway Cafe menu by category, from breakfast and sandwiches to burgers, panini, extras, and drinks.",
};

export default async function MenuPage() {
  const dbCategories = await getCategories();
  const categories = dbCategories.map((category: any) => ({
    id: category.id ?? category.slug,
    name: category.name,
    slug: category.slug,
    image_url: category.image_url ?? undefined,
  }));

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
              Browse the Halfway Cafe menu by category and head straight into
              the dishes you&apos;re after.
            </p>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <CategoriesSection categories={categories} />
      ) : (
        <section className="bg-white pb-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="rounded-3xl border border-border bg-bg-soft px-6 py-12 text-center shadow-sm">
              <p className="font-playfair text-2xl font-bold text-text">
                Menu categories are being updated.
              </p>
              <p className="mt-3 font-inter text-sm leading-6 text-text-mid">
                Please check back shortly or contact the cafe for the latest menu.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
