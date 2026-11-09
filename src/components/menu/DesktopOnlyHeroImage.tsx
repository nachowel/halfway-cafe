import { resolveRequiredPublicImage } from "@/lib/public-images.server";

const MOBILE_FALLBACK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

interface DesktopOnlyHeroImageProps {
  source: string;
  alt: string;
  className?: string;
  sizes: string;
}

export default function DesktopOnlyHeroImage({
  source,
  alt,
  className,
  sizes,
}: DesktopOnlyHeroImageProps) {
  const image = resolveRequiredPublicImage(source, "hero");

  return (
    <picture>
      <source
        media="(min-width: 768px)"
        srcSet={image.srcSet ?? image.src}
        sizes={sizes}
      />
      {/* The real source is desktop-only; mobile receives this inline fallback without a request. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MOBILE_FALLBACK_IMAGE}
        alt={alt}
        className={className}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );
}
