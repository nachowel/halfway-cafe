export const MAX_IMAGE_BYTES = 4_000_000;
export const MAX_IMAGE_DIMENSION = 6_000;
export const MAX_IMAGE_PIXELS = 25_000_000;

const FORMAT_MIME = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export type AllowedImageFormat = keyof typeof FORMAT_MIME;
export type AllowedImageMime = (typeof FORMAT_MIME)[AllowedImageFormat];

export class UploadValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export function assertAllowedClaimedMime(value: string | null): asserts value is AllowedImageMime {
  if (!value || !Object.values(FORMAT_MIME).includes(value as AllowedImageMime)) {
    throw new UploadValidationError("Only JPEG, PNG, and WebP images are allowed");
  }
}

export interface ImageMetadataInput {
  format?: string;
  width?: number;
  height?: number;
  pages?: number;
}

export interface ValidatedImageMetadata {
  format: AllowedImageFormat;
  mime: AllowedImageMime;
  width: number;
  height: number;
}

export function assertImageMetadata(
  metadata: ImageMetadataInput,
  claimedMime: string,
): ValidatedImageMetadata {
  assertAllowedClaimedMime(claimedMime);
  const format = metadata.format as AllowedImageFormat | undefined;
  if (!format || !(format in FORMAT_MIME)) {
    throw new UploadValidationError("The uploaded bytes are not a supported JPEG, PNG, or WebP image");
  }
  if (FORMAT_MIME[format] !== claimedMime) {
    throw new UploadValidationError("The declared MIME type does not match the decoded image format");
  }
  if (!metadata.width || !metadata.height || metadata.width < 1 || metadata.height < 1) {
    throw new UploadValidationError("Image dimensions could not be decoded");
  }
  if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
    throw new UploadValidationError(`Image dimensions may not exceed ${MAX_IMAGE_DIMENSION}px`);
  }
  if (metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
    throw new UploadValidationError("Images may not exceed 25 megapixels");
  }
  if ((metadata.pages ?? 1) !== 1) {
    throw new UploadValidationError("Animated or multi-page images are not allowed");
  }
  return { format, mime: FORMAT_MIME[format], width: metadata.width, height: metadata.height };
}

export async function readBodyWithLimit(request: Request, limit = MAX_IMAGE_BYTES): Promise<Buffer> {
  if (!request.body) throw new UploadValidationError("An image body is required");
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > limit) {
    throw new UploadValidationError("The image exceeds the maximum allowed size");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        throw new UploadValidationError("The image exceeds the maximum allowed size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (total === 0) throw new UploadValidationError("An image body is required");
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total);
}
