import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";

const defaultImages = [
  {
    src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=80",
    alt: "Morning seating area inside Halfway Cafe on Halfway Street",
  },
  {
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80",
    alt: "Freshly brewed coffee ready at the counter in Sidcup",
  },
  {
    src: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&q=80",
    alt: "Full English breakfast with eggs, bacon and baked beans",
  },
  {
    src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
    alt: "Latte in a ceramic cup on a cafe table",
  },
  {
    src: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=500&q=80",
    alt: "Cosy corner seating inside the local Sidcup cafe",
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
        <ScrollReveal duration={750}>
          <SectionHeader
            kicker="The Atmosphere"
            title="A Glimpse"
            titleItalic="Inside"
            centered
          />
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-4">
          {galleryImages.map((img, i) => (
            <ScrollReveal
              key={img.src}
              duration={800}
              delay={i * 100}
              className={
                i === 0
                  ? "col-span-2 h-[200px] md:col-span-2 md:row-span-2 md:h-[500px]"
                  : "h-[200px] md:h-[240px]"
              }
            >
              <div className="group relative h-full w-full overflow-hidden rounded-xl">
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

