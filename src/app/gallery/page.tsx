/* Halfway Cafe — Gallery page */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getGalleryImages } from "@/lib/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Take a look inside Halfway Cafe — our cosy interior, freshly cooked food, and the community we love.",
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

export default async function GalleryPage() {
  const dbGallery = await getGalleryImages();

  const images =
    dbGallery.length > 0
      ? dbGallery.map((img: any) => ({ src: img.url, alt: img.alt_text ?? "" }))
      : defaultImages;

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
            <span className="mx-2">&rarr;</span>
            <span className="text-ink">Gallery</span>
          </nav>

          <h1 className="font-playfair text-4xl font-bold text-ink md:text-5xl">
            Our Gallery
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-lora text-base italic text-ink-light">
            A glimpse inside Halfway Cafe &mdash; the food, the space, and the
            people who make it special.
          </p>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="bg-parchment py-24">
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {images.map((img: { src: string; alt: string }, i: number) => (
                <div
                  key={img.src}
                  className={`group relative overflow-hidden ${
                    i === 0
                      ? "col-span-2 row-span-2 h-[400px] lg:h-[544px]"
                      : "h-[260px] lg:h-[264px]"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={
                      i === 0
                        ? "(max-width: 768px) 100vw, 66vw"
                        : "(max-width: 768px) 50vw, 33vw"
                    }
                  />
                  {/* Hover overlay with alt text */}
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

      {/* Spacer before footer */}
      <div className="h-12 bg-parchment" />
    </>
  );
}
