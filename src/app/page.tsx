/* Halfway Cafe — Home page */

import { Suspense } from "react";
import HeroSection from "@/components/sections/HeroSection";
import FeaturedSection from "@/components/sections/FeaturedSection";
import MenuSection from "@/components/sections/MenuSection";
import AboutSection from "@/components/sections/AboutSection";
import GallerySection from "@/components/sections/GallerySection";
import LocationSection from "@/components/sections/LocationSection";
import { getMenuItems, getFeaturedItems, getOpeningHours, getGalleryImages, getCategories } from "@/lib/queries";
import { menuItems as fallbackMenu, getFeatured as getFallbackFeatured } from "@/data/menu";
import { openingHours as fallbackHours } from "@/data/opening-hours";
import type { MenuItem, OpeningHours } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map a Supabase menu_items row → front-end MenuItem shape */
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

/** Map a Supabase opening_hours row → front-end OpeningHours shape */
function toOpeningHours(row: any): OpeningHours {
  return {
    day: row.day_name,
    open: row.open_time ?? "00:00",
    close: row.close_time ?? "00:00",
    closed: row.is_closed ?? false,
  };
}

function SectionLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center bg-parchment">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
    </div>
  );
}

export default async function Home() {
  // Fetch from Supabase — fall back to mock data if empty / connection fails
  const [dbMenu, dbFeatured, dbHours, dbGallery, dbCategories] = await Promise.all([
    getMenuItems(),
    getFeaturedItems(),
    getOpeningHours(),
    getGalleryImages(),
    getCategories(),
  ]);

  const menuItems: MenuItem[] =
    dbMenu.length > 0 ? dbMenu.map(toMenuItem) : fallbackMenu;

  const featuredItems: MenuItem[] =
    dbFeatured.length > 0 ? dbFeatured.map(toMenuItem) : getFallbackFeatured();

  const hours: OpeningHours[] =
    dbHours.length > 0 ? dbHours.map(toOpeningHours) : fallbackHours;

  const categories = dbCategories.length > 0
    ? dbCategories.map((c: any) => ({ slug: c.slug, name: c.name }))
    : [
        { slug: "breakfast", name: "Breakfast" },
        { slug: "lunch", name: "Lunch" },
        { slug: "burgers", name: "Burgers" },
        { slug: "desserts", name: "Desserts" },
        { slug: "drinks", name: "Drinks" },
      ];

  const galleryImages =
    dbGallery.length > 0
      ? dbGallery.map((img: any) => ({ src: img.url, alt: img.alt_text ?? "" }))
      : undefined; // GallerySection will use its own defaults

  return (
    <>
      <Suspense fallback={<SectionLoader />}>
        <HeroSection openingHours={hours} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FeaturedSection items={featuredItems} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <MenuSection items={menuItems} categories={categories} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <GallerySection images={galleryImages} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <LocationSection />
      </Suspense>
    </>
  );
}
