import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import type { RemoteImageAsset } from "./admin-image-upload-service";
import { buildCloudinaryUploadOptions, cloudinaryHttpCode } from "./cloudinary-upload-core";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary admin credentials are not configured");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return cloudinary;
}

function toRemoteAsset(response: UploadApiResponse | Record<string, unknown>): RemoteImageAsset {
  return {
    publicId: String(response.public_id ?? ""),
    assetId: String(response.asset_id ?? ""),
    version: Number(response.version ?? 0),
    format: String(response.format ?? ""),
    width: Number(response.width ?? 0),
    height: Number(response.height ?? 0),
    bytes: Number(response.bytes ?? 0),
    existing: response.existing === true,
  };
}

export async function uploadHalfwayImage(
  buffer: Buffer,
  publicId: string,
  filename: string,
): Promise<RemoteImageAsset> {
  const client = configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      buildCloudinaryUploadOptions(publicId, filename),
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary returned no upload result"));
          return;
        }
        resolve(toRemoteAsset(result));
      },
    );
    stream.on("error", reject);
    stream.end(buffer);
  });
}

export async function findHalfwayImage(publicId: string): Promise<RemoteImageAsset | null> {
  if (!publicId.startsWith("halfway-cafe/admin/")) {
    throw new Error("Refusing Cloudinary lookup outside the Halfway Cafe admin namespace");
  }
  try {
    const result = await configureCloudinary().api.resource(publicId, {
      resource_type: "image",
      type: "upload",
    });
    return toRemoteAsset(result as Record<string, unknown>);
  } catch (error) {
    const code = cloudinaryHttpCode(error);
    if (code === 404) return null;
    throw error;
  }
}
