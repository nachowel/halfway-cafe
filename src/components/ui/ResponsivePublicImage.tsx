import type { CSSProperties, ImgHTMLAttributes } from "react";

import type { ResolvedPublicImage } from "@/types/public-image";
import { defaultImageSizes } from "@/lib/public-image-data";

export type ResponsivePublicImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "width" | "height" | "loading"
> & {
  image: ResolvedPublicImage;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  loading?: "eager" | "lazy";
};

export default function ResponsivePublicImage({
  image,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  loading,
  sizes,
  style,
  decoding,
  ...props
}: ResponsivePublicImageProps) {
  const resolvedStyle: CSSProperties | undefined = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }
    : style;
  const resolvedSizes = defaultImageSizes({ sizes, width, fill });

  return (
    // Direct provider delivery is intentional: Strict Transformations are signed server-side.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={image.src}
      srcSet={image.srcSet}
      sizes={resolvedSizes}
      alt={alt}
      width={fill ? undefined : width ?? image.width}
      height={fill ? undefined : height ?? image.height}
      style={resolvedStyle}
      loading={priority ? "eager" : loading ?? "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={decoding ?? "async"}
    />
  );
}

