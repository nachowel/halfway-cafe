import type { CSSProperties } from "react";
import NextImage, { type ImageProps } from "next/image";
import {
  getRecoveryImage,
  getRecoveryVariantUrl,
  isSupabaseStorageImage,
  type RecoveryImage,
} from "@/lib/recovery-images";

type RecoveryImageProps = ImageProps & {
  recoveryImage: RecoveryImage;
};

function buildSrcSet(image: RecoveryImage, format: "avif" | "webp") {
  return image.widths
    .map((width) => `${getRecoveryVariantUrl(image, width, format)} ${width}w`)
    .join(", ");
}

function ResponsiveRecoveryImage({
  recoveryImage,
  alt,
  sizes,
  width,
  height,
  fill,
  priority,
  loading,
  className,
  style,
  decoding,
  quality: _quality,
  loader: _loader,
  unoptimized: _unoptimized,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  onLoadingComplete: _onLoadingComplete,
  ...imgProps
}: RecoveryImageProps) {
  const largestWidth = recoveryImage.widths.at(-1) ?? recoveryImage.width;
  const resolvedSizes =
    sizes ?? (typeof width === "number" ? `${width}px` : "100vw");
  const resolvedWidth = typeof width === "number" ? width : recoveryImage.width;
  const resolvedHeight = typeof height === "number" ? height : recoveryImage.height;
  const resolvedStyle: CSSProperties | undefined = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }
    : style;
  const webpSrcSet = buildSrcSet(recoveryImage, "webp");

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={buildSrcSet(recoveryImage, "avif")}
        sizes={resolvedSizes}
      />
      <source type="image/webp" srcSet={webpSrcSet} sizes={resolvedSizes} />
      <img
        {...imgProps}
        src={getRecoveryVariantUrl(recoveryImage, largestWidth, "webp")}
        srcSet={webpSrcSet}
        sizes={resolvedSizes}
        alt={alt}
        width={resolvedWidth}
        height={resolvedHeight}
        className={className}
        style={resolvedStyle}
        loading={priority ? "eager" : loading ?? "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={decoding ?? "async"}
      />
    </picture>
  );
}

export default function PublicImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : null;
  const recoveryImage = src ? getRecoveryImage(src) : null;

  if (recoveryImage) {
    return <ResponsiveRecoveryImage {...props} recoveryImage={recoveryImage} />;
  }

  if (src && isSupabaseStorageImage(src)) {
    return <NextImage {...props} unoptimized />;
  }

  return <NextImage {...props} />;
}
