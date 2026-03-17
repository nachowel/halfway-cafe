/* Halfway Cafe — Desktop home page */

import { Suspense } from "react";
import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import AboutSection from "@/components/sections/AboutSection";
import GallerySection from "@/components/sections/GallerySection";
import LocationSection from "@/components/sections/LocationSection";
import {
  getOpeningHours,
  getGalleryImages,
  getCategories,
  getSiteSettingsByKeys,
} from "@/lib/queries";
import { openingHours as fallbackHours } from "@/data/opening-hours";
import { getDesktopHeroImage } from "@/lib/site-settings";
import { BUILDERS_BREAKFAST_IMAGE_URL } from "@/lib/storage";
import type { OpeningHours } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

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

export default async function DesktopHome() {
  const [dbHours, dbGallery, dbCategories, siteSettings] = await Promise.all([
    getOpeningHours(),
    getGalleryImages(),
    getCategories(),
    getSiteSettingsByKeys(["hero_image_web"]),
  ]);

  const hours: OpeningHours[] =
    dbHours.length > 0 ? dbHours.map(toOpeningHours) : fallbackHours;

  const categories = dbCategories.length > 0
    ? dbCategories.map((category: any) => ({
        id: category.id ?? category.slug,
        slug: category.slug,
        name: category.name,
        image_url: category.image_url ?? undefined,
      }))
    : [
        {
          id: "breakfast",
          slug: "breakfast",
          name: "Breakfast",
          image_url: BUILDERS_BREAKFAST_IMAGE_URL,
        },
        { id: "lunch", slug: "lunch", name: "Lunch", image_url: undefined },
        { id: "burgers", slug: "burgers", name: "Burgers", image_url: undefined },
        { id: "drinks", slug: "drinks", name: "Drinks", image_url: undefined },
      ];

  const galleryImages =
    dbGallery.length > 0
      ? dbGallery.map((img: any) => ({ src: img.url, alt: img.alt_text ?? "" }))
      : undefined;
  const heroImageUrl = getDesktopHeroImage(siteSettings);

  return (
    <>
      <Suspense fallback={<SectionLoader />}>
        <HeroSection openingHours={hours} heroImageUrl={heroImageUrl} />
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
