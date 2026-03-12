/* Halfway Cafe — Home page */

import { Suspense } from "react";
import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import AboutSection from "@/components/sections/AboutSection";
import GallerySection from "@/components/sections/GallerySection";
import LocationSection from "@/components/sections/LocationSection";
import { getOpeningHours, getGalleryImages, getCategories } from "@/lib/queries";
import { openingHours as fallbackHours } from "@/data/opening-hours";
import type { OpeningHours } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  const [dbHours, dbGallery, dbCategories] = await Promise.all([
    getOpeningHours(),
    getGalleryImages(),
    getCategories(),
  ]);

  const hours: OpeningHours[] =
    dbHours.length > 0 ? dbHours.map(toOpeningHours) : fallbackHours;

  const categories = dbCategories.length > 0
    ? dbCategories.map((c: any) => ({
        id: c.id ?? c.slug,
        slug: c.slug,
        name: c.name,
        image_url: c.image_url ?? undefined,
      }))
    : [
        { id: "breakfast", slug: "breakfast", name: "Breakfast", image_url: undefined },
        { id: "lunch", slug: "lunch", name: "Lunch", image_url: undefined },
        { id: "burgers", slug: "burgers", name: "Burgers", image_url: undefined },
        { id: "desserts", slug: "desserts", name: "Desserts", image_url: undefined },
        { id: "drinks", slug: "drinks", name: "Drinks", image_url: undefined },
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
        <CategoriesSection categories={categories} />
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
