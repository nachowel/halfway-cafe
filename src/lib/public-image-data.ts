export function withoutImageSource<T extends { image_url?: unknown }>(row: T): Omit<T, "image_url"> {
  const safeRow = { ...row };
  delete safeRow.image_url;
  return safeRow;
}

export function defaultImageSizes({
  sizes,
  width,
  fill,
}: {
  sizes?: string;
  width?: number;
  fill: boolean;
}) {
  if (sizes) return sizes;
  return !fill && width ? `${width}px` : undefined;
}
