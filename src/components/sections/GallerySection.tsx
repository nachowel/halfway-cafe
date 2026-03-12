/* GallerySection — Asymmetric photo grid with hover effects */

import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";

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

interface GallerySectionProps {
  images?: { src: string; alt: string }[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  const galleryImages = images ?? defaultImages;
  return (
    <section className="bg-parchment py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          kicker="The Atmosphere"
          title="A Glimpse"
          titleItalic="Inside"
          centered
        />

        {/* Asymmetric grid */}
        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-4">
          {galleryImages.map((img, i) => (
            <div
              key={img.src}
              className={`group relative overflow-hidden rounded-xl ${
                i === 0
                  ? "col-span-2 h-[200px] md:col-span-2 md:row-span-2 md:h-[500px]"
                  : "h-[200px] md:h-[240px]"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                sizes={
                  i === 0
                    ? "(max-width: 768px) 100vw, 66vw"
                    : "(max-width: 768px) 50vw, 33vw"
                }
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
