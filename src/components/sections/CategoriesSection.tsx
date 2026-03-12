/* CategoriesSection — Visual category grid with image fallbacks by slug */

import Image from "next/image";
import Link from "next/link";

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
  breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80",
  lunch: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  drinks: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  sandwiches: "https://images.unsplash.com/photo-1485962398705-ef6a13c41e8f?w=600&q=80",
};

function getCategoryImage(category: Category): string | null {
  return category.image_url || fallbackImages[category.slug] || null;
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="bg-bg-soft py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-playfair text-4xl font-bold text-text md:text-5xl">
            What Would You Like?
          </h2>
          <p className="mt-4 font-inter text-lg text-text-mid">
            Freshly made, every single day.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const imageSrc = getCategoryImage(category);

            return (
              <Link
                key={category.id}
                href={`/menu/${category.slug}`}
                className="group relative block h-[200px] overflow-hidden rounded-xl no-underline shadow-sm transition-transform duration-300 hover:scale-[1.05] hover:shadow-xl"
              >
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#ff6b35_0%,#ffc857_100%)]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-85" />

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-playfair text-2xl font-bold text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
