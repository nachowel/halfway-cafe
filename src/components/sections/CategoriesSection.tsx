import Link from "next/link";
import { BUILDERS_BREAKFAST_IMAGE_URL } from "@/lib/storage";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ResponsivePublicImage from "@/components/ui/ResponsivePublicImage";
import { resolvePublicImage } from "@/lib/public-images.server";

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
        <ScrollReveal duration={800}>
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
        </ScrollReveal>
        
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {categories.map((category, index) => {
            const image = resolvePublicImage(
              category.image_url || fallbackImages[category.slug] || null,
              "card",
            );

            return (
              <ScrollReveal
                key={category.id}
                duration={700}
                delay={index * 120}
              >
                <Link
                  href={`/menu/${category.slug}`}
                  className="group relative block h-[180px] w-full overflow-hidden rounded-[12px] no-underline shadow-[0_4px_16px_rgba(29,21,14,0.06)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(29,21,14,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-soft md:h-[220px]"
                >
                  {image ? (
                    <ResponsivePublicImage
                      image={image}
                      alt={`${category.name} dishes at Halfway Cafe in Sidcup`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#c86f33_0%,#f1c37a_100%)]" />
                  )}

                  <div className="absolute inset-0 bg-black/20" />
                  <div
                    className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-95"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.45) 50%, rgba(0, 0, 0, 0.1) 100%)",
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
                      className="mt-2 max-w-[90%] font-inter text-sm leading-5 text-white/90"
                      style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.36)" }}
                    >
                      {getCategorySeoLine(category)}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

