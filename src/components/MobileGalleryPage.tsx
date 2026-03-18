"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileFooter from "@/components/MobileFooter";

type GalleryImage = {
  src: string;
  alt: string;
};

type GallerySection = {
  title: string;
  images: GalleryImage[];
};

function chunkImages(images: GalleryImage[], chunkSize: number) {
  const rows: GalleryImage[][] = [];

  for (let index = 0; index < images.length; index += chunkSize) {
    rows.push(images.slice(index, index + chunkSize));
  }

  return rows;
}

export default function MobileGalleryPage({
  sections,
}: {
  sections: GallerySection[];
}) {
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  useEffect(() => {
    if (!previewImage) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsPreviewVisible(true);
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [previewImage]);

  function openPreview(image: GalleryImage) {
    setPreviewImage(image);
  }

  function closePreview() {
    setIsPreviewVisible(false);

    window.setTimeout(() => {
      setPreviewImage(null);
    }, 150);
  }

  return (
    <div className="bg-[#FAF8F5] md:hidden">
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-[#E8E2D9] bg-[#FAF8F5] px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-inter text-base font-semibold text-[#1A1A1A] no-underline"
        >
          <ChevronLeft size={20} strokeWidth={1.5} className="text-[#6B6B6B]" />
          <span>Gallery</span>
        </Link>
      </header>

      <section className="px-4 pb-3 pt-6">
        <h1 className="font-playfair text-[2rem] font-bold text-[#1A1A1A]">Gallery</h1>
        <p className="mt-1 font-inter text-[15px] text-[#7C746B]">Inside Halfway Cafe</p>
      </section>

      <section className="px-4 pb-[88px] pt-2">
        <div className="space-y-8">
          {sections.map((section) => {
            const [leadImage, ...restImages] = section.images;
            const rows = chunkImages(restImages, 2);

            return (
              <section key={section.title}>
                <h2 className="mb-3 font-inter text-[18px] font-semibold text-[#241F19]">
                  {section.title}
                </h2>

                <div className="space-y-3">
                  {leadImage ? (
                    <button
                      type="button"
                      onClick={() => openPreview(leadImage)}
                      className="relative block h-[220px] w-full overflow-hidden rounded-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                      aria-label={`Preview ${leadImage.alt || section.title}`}
                    >
                      <Image
                        src={leadImage.src}
                        alt={leadImage.alt}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    </button>
                  ) : null}

                  {rows.map((row, rowIndex) => (
                    <div key={`${section.title}-${rowIndex}`} className="grid grid-cols-2 gap-3">
                      {row.map((image) => (
                        <button
                          key={image.src}
                          type="button"
                          onClick={() => openPreview(image)}
                          className="relative block h-[148px] w-full overflow-hidden rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
                          aria-label={`Preview ${image.alt || section.title}`}
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="50vw"
                          />
                        </button>
                      ))}
                      {row.length === 1 ? <div aria-hidden="true" /> : null}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {previewImage ? (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.65)] p-6 transition-opacity duration-150 ${
            isPreviewVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closePreview}
        >
          <div
            className={`w-full max-w-[92vw] transition duration-150 ${
              isPreviewVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
              <div className="relative mx-auto min-h-[240px] w-full overflow-hidden rounded-t-[18px] bg-white/5">
                <button
                  type="button"
                  onClick={closePreview}
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(0,0,0,0.5)] text-white"
                  aria-label="Close image preview"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>

                <Image
                  src={previewImage.src}
                  alt={previewImage.alt}
                  width={1200}
                  height={1200}
                  className="block h-auto max-h-[80vh] w-full object-contain"
                />
              </div>

              {previewImage.alt ? (
                <div className="px-4 pb-4 pt-[12px] text-[#1A1A1A]">
                  <p className="font-inter text-sm leading-6 text-[#6B6B6B]">
                    {previewImage.alt}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <MobileFooter />
      <MobileBottomNav />
    </div>
  );
}
