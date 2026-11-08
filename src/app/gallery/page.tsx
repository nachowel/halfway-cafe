/* Halfway Cafe — Gallery page */

import type { Metadata } from "next";
import Link from "next/link";
import MobileGalleryPage from "@/components/MobileGalleryPage";
import ResponsivePublicImage from "@/components/ui/ResponsivePublicImage";
import { getGalleryImages } from "@/lib/queries";
import { resolveRequiredPublicImage } from "@/lib/public-images.server";
import type { ResolvedPublicImage } from "@/types/public-image";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Take a look inside Halfway Cafe — our cosy interior, freshly cooked food, and the community we love.",
  alternates: {
    canonical: "/gallery",
  },
};

const defaultImages = [
  {
    src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80",
    alt: "Halfway Cafe warm interior with morning light",
  },
  {
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80",
    alt: "Freshly brewed coffee on the counter",
  },
  {
    src: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&q=80",
    alt: "Full English breakfast plate",
  },
  {
    src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
    alt: "Latte art in a ceramic cup",
  },
  {
    src: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=500&q=80",
    alt: "Cosy cafe seating area",
  },
];

type GalleryImage = {
  image: ResolvedPublicImage;
  alt: string;
};

type GallerySection = {
  title: string;
  images: GalleryImage[];
};

function getSectionTitleIndex(alt: string) {
  const normalizedAlt = alt.toLowerCase();

  if (
    ["coffee", "latte", "espresso", "cappuccino", "tea", "cup"].some((keyword) =>
      normalizedAlt.includes(keyword)
    )
  ) {
    return 2;
  }

  if (
    ["breakfast", "food", "plate", "burger", "toast", "egg", "dish", "sandwich"].some((keyword) =>
      normalizedAlt.includes(keyword)
    )
  ) {
    return 1;
  }

  return 0;
}

function buildGallerySections(images: GalleryImage[]): GallerySection[] {
  const sections: GallerySection[] = [
    { title: "Inside the cafe", images: [] },
    { title: "Food & breakfast", images: [] },
    { title: "Coffee moments", images: [] },
  ];

  images.forEach((image) => {
    const index = getSectionTitleIndex(image.alt);
    sections[index].images.push(image);
  });

  return sections.filter((section) => section.images.length > 0);
}

export default async function GalleryPage() {
  const dbGallery = await getGalleryImages();

  const sourceImages =
    dbGallery.length > 0
      ? dbGallery.map((img: any) => ({ src: img.url, alt: img.alt_text ?? "" }))
      : defaultImages;
  const images = sourceImages.map((image) => ({
    image: resolveRequiredPublicImage(image.src, "content"),
    alt: image.alt,
  }));
  const mobileSections = buildGallerySections(images);

  return (
    <>
      <MobileGalleryPage sections={mobileSections} />

      <section className="hidden bg-[linear-gradient(180deg,#f8f4ee_0%,#faf8f5_100%)] pb-6 pt-20 md:block md:pb-12 md:pt-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <nav className="mb-4 font-lora text-sm text-ink-light">
            <Link href="/" className="text-ink-light no-underline hover:text-red">
              Home
            </Link>
            <span className="mx-2">&rarr;</span>
            <span className="text-ink">Gallery</span>
          </nav>

          <div className="text-center md:text-left">
            <h2 className="font-playfair text-[2.25rem] font-bold text-ink md:text-5xl">
              Gallery
            </h2>
            <p className="mt-1.5 font-inter text-[15px] text-[#7C746B] md:mt-3 md:max-w-lg md:text-base">
              Inside Halfway Cafe
            </p>
          </div>
        </div>
      </section>

      <section className="hidden bg-[#FAF8F5] pb-28 pt-2 md:block md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {images.length === 0 ? (
            <div className="text-center">
              <p className="font-playfair text-2xl text-ink/40">
                No images to show yet
              </p>
              <p className="mt-2 font-lora text-sm italic text-ink-light">
                Check back soon &mdash; we&apos;re updating our gallery.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 md:gap-4">
                {images.map((img: GalleryImage, i: number) => (
                  <div
                    key={img.image.src}
                    className={`group relative overflow-hidden rounded-2xl ${
                      i === 0
                        ? "col-span-2 row-span-2 h-[400px] lg:h-[544px]"
                        : "h-[260px] lg:h-[264px]"
                    }`}
                  >
                    <ResponsivePublicImage
                      image={img.image}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes={
                        i === 0
                          ? "(max-width: 768px) 100vw, 66vw"
                          : "(max-width: 768px) 50vw, 33vw"
                      }
                    />
                    <div className="absolute inset-0 flex items-end bg-ink/0 transition-colors duration-500 group-hover:bg-ink/30">
                      {img.alt && (
                        <p className="w-full bg-gradient-to-t from-ink/60 to-transparent px-4 pb-4 pt-10 font-lora text-sm text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          {img.alt}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      <div className="h-4 bg-[#FAF8F5] md:h-12 md:bg-parchment" />
    </>
  );
}
