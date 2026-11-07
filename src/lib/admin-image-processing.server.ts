import { createHash } from "node:crypto";
import sharp, { type Metadata } from "sharp";

import { sanitizeAssetFilename } from "./admin-image-core.ts";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGE_PIXELS,
  UploadValidationError,
  assertImageMetadata,
  type AllowedImageFormat,
  type AllowedImageMime,
} from "./admin-upload-core.ts";

export interface NormalizedImage {
  buffer: Buffer;
  byteSize: number;
  format: AllowedImageFormat;
  mime: AllowedImageMime;
  width: number;
  height: number;
  sha256: string;
  safeFilename: string;
}

const extensions: Record<AllowedImageFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export async function validateAndNormalizeImage(
  source: Buffer,
  claimedMime: string,
  originalFilename: string,
): Promise<NormalizedImage> {
  if (source.byteLength < 1 || source.byteLength > MAX_IMAGE_BYTES) {
    throw new UploadValidationError("The image exceeds the maximum allowed size");
  }

  let inputMetadata: Metadata;
  try {
    inputMetadata = await sharp(source, {
      animated: true,
      failOn: "warning",
      limitInputPixels: MAX_IMAGE_PIXELS,
    }).metadata();
  } catch {
    throw new UploadValidationError("The uploaded bytes are not a decodable image");
  }

  const verifiedInput = assertImageMetadata(inputMetadata, claimedMime);
  let pipeline = sharp(source, {
    animated: false,
    failOn: "warning",
    limitInputPixels: MAX_IMAGE_PIXELS,
  }).rotate();

  if (verifiedInput.format === "jpeg") pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
  if (verifiedInput.format === "png") pipeline = pipeline.png({ compressionLevel: 9 });
  if (verifiedInput.format === "webp") pipeline = pipeline.webp({ quality: 90 });

  const buffer = await pipeline.toBuffer();
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new UploadValidationError("The normalized image exceeds the maximum allowed size");
  }

  const outputMetadata = await sharp(buffer, {
    animated: true,
    failOn: "warning",
    limitInputPixels: MAX_IMAGE_PIXELS,
  }).metadata();
  const verifiedOutput = assertImageMetadata(outputMetadata, claimedMime);
  const slug = sanitizeAssetFilename(originalFilename);

  return {
    buffer,
    byteSize: buffer.byteLength,
    format: verifiedOutput.format,
    mime: verifiedOutput.mime,
    width: verifiedOutput.width,
    height: verifiedOutput.height,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    safeFilename: `${slug}.${extensions[verifiedOutput.format]}`,
  };
}
