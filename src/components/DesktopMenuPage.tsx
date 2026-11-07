/* Halfway Cafe — Desktop menu landing page */

import Link from "next/link";
import CategoriesSection from "@/components/sections/CategoriesSection";
import ServerPublicImage from "@/components/ui/ServerPublicImage";
import { getCategories } from "@/lib/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

const menuHeroImage =
  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1600&q=80";

export default async function DesktopMenuPage() {
  const dbCategories = await getCategories();
  const categories = dbCategories.map((category: any) => ({
    id: category.id ?? category.slug,
    name: category.name,
    slug: category.slug,
    image_url: category.image_url ?? undefined,
  }));

  return (
    <>
      <section className="bg-[linear-gradient(180deg,#f6efe6_0%,#faf7f2_100%)] pb-5 pt-20 md:pt-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="relative mb-4 h-[148px] overflow-hidden rounded-[20px] shadow-[0_12px_30px_rgba(29,21,14,0.14)] md:h-[220px]">
            <ServerPublicImage
              source={menuHeroImage}
              role="hero"
              alt="Halfway Cafe breakfast and coffee on a table"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) calc(100vw - 64px), 1216px"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,10,7,0.08)_0%,rgba(14,10,7,0.2)_45%,rgba(14,10,7,0.38)_100%)]" />
          </div>

          <nav className="mb-2 font-inter text-sm text-text-mid">
            <Link href="/" className="text-text-mid no-underline hover:text-accent">
              Home
            </Link>
            <span className="mx-2">→</span>
            <span className="text-text">Menu</span>
          </nav>

          <div className="max-w-xl">
            <h1 className="font-playfair text-[2.35rem] font-bold leading-none text-text md:text-5xl">
              Our Menu
            </h1>
            <p className="mt-2 font-inter text-base leading-7 text-text-mid md:text-lg">
              Freshly made, every day. Looking for{" "}
              <Link href="/breakfast-sidcup" className="text-text-mid no-underline hover:text-accent">
                breakfast in Sidcup
              </Link>
              ? Start here.
            </p>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <CategoriesSection categories={categories} />
      ) : (
        <section className="bg-[linear-gradient(180deg,#f6efe6_0%,#faf7f2_100%)] pb-24">
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
