/* CategoriesSection — Visual category grid with image fallbacks by slug */

import Image from "next/image";
import Link from "next/link";
import { BUILDERS_BREAKFAST_IMAGE_URL } from "@/lib/storage";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

interface CategoriesSectionProps {
  categories: Category[];
}

const fallbackImages: Record<string, string> = {
  breakfast: BUILDERS_BREAKFAST_IMAGE_URL,
  lunch: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  drinks: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  sandwiches: "https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?w=600&q=80",
};

function getCategoryImage(category: Category): string | null {
  return category.image_url || fallbackImages[category.slug] || null;
}

function getCategorySeoLine(category: Category): string {
  const copyBySlug: Record<string, string> = {
    breakfast: "Explore full English breakfast and morning favourites in Sidcup.",
    sandwiches: "Freshly made sandwiches and hot rolls prepared daily.",
    burgers: "Hot made-to-order burgers served fresh every day.",
    lunch: "Hearty lunch plates for a quick midday stop.",
    panini: "Crisp toasted paninis with generous fillings.",
    drinks: "Builder's tea, coffee, and cold drinks all day.",
    desserts: "Classic sweet treats to finish your meal.",
  };

  return copyBySlug[category.slug] ?? "Freshly prepared cafe favourites served daily in Sidcup.";
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-soft)_100%)] pb-24 pt-0">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="pb-10 pt-10 md:pb-12">
          <p className="mx-auto max-w-5xl font-inter text-base leading-8 text-text-mid md:text-lg">
            Looking for the best breakfast in Sidcup? Halfway Cafe is a local favourite
            serving full English breakfast, freshly made sandwiches, and quality coffee
            every day. Located on Halfway Street (DA15), we&apos;re a family-run cafe known
            for generous portions, quick service, and a proper traditional London caff
            experience. Whether you&apos;re stopping by for a quick bite or a relaxed
            breakfast, we&apos;re ready to serve.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {categories.map((category) => {
            const imageSrc = getCategoryImage(category);

            return (
              <Link
                key={category.id}
                href={`/menu/${category.slug}`}
                className="group relative block h-[180px] overflow-hidden rounded-[20px] no-underline shadow-[0_16px_38px_rgba(29,21,14,0.16)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(29,21,14,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-soft md:h-[220px]"
              >
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={`${category.name} dishes at Halfway Cafe in Sidcup`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#c86f33_0%,#f1c37a_100%)]" />
                )}

                <div className="absolute inset-0 bg-black/10" />
                <div
                  className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.25), transparent)",
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3
                    className="max-w-[85%] font-playfair text-[24px] font-bold leading-[1.06] text-white md:text-4xl"
                    style={{ textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)" }}
                  >
                    {category.name}
                  </h3>
                  <p
                    className="mt-2 max-w-[90%] font-inter text-sm leading-5 text-white/95"
                    style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.36)" }}
                  >
                    {getCategorySeoLine(category)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
