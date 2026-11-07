import { createHash } from "node:crypto";

import type {
  CloudinaryAssetMapping,
  CloudinaryAssetMappingEntry,
  PublicImageRole,
  ResolvedPublicImage,
} from "../types/public-image.ts";
import { parseCloudinaryReference } from "./admin-image-core.ts";

export const RESPONSIVE_WIDTHS = [96, 192, 256, 384, 640, 828, 1080, 1376, 1600] as const;

const ROLE_TARGETS: Record<PublicImageRole, number> = {
  logo: 192,
  thumbnail: 384,
  card: 828,
  content: 1080,
  hero: 1600,
};

function assertMapping(mapping: CloudinaryAssetMapping) {
  if (mapping.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(mapping.manifestSha256)) {
    throw new Error("Invalid Cloudinary application mapping");
  }
  const objectPaths = new Set<string>();
  for (const asset of mapping.assets) {
    if (!asset.publicId.startsWith("halfway-cafe/")) {
      throw new Error(`Cloudinary asset is outside the halfway-cafe namespace: ${asset.publicId}`);
    }
    if (!/^halfway-cafe\/[a-z0-9/_-]+--[a-f0-9]{12}$/.test(asset.publicId)) {
      throw new Error(`Invalid canonical Cloudinary public ID: ${asset.publicId}`);
    }
    if (objectPaths.has(asset.objectPath)) {
      throw new Error(`Duplicate mapped object path: ${asset.objectPath}`);
    }
    if (!Number.isInteger(asset.version) || asset.version < 1 ||
        !Number.isInteger(asset.width) || asset.width < 1 ||
        !Number.isInteger(asset.height) || asset.height < 1) {
      throw new Error(`Invalid mapped image metadata: ${asset.objectPath}`);
    }
    objectPaths.add(asset.objectPath);
  }
}

export function signCloudinaryDeliveryPath(deliveryPath: string, apiSecret: string) {
  return createHash("sha256")
    .update(`${deliveryPath}${apiSecret}`)
    .digest("base64url")
    .slice(0, 8);
}

function responsiveWidths(intrinsicWidth: number) {
  const widths = RESPONSIVE_WIDTHS.filter((width) => width <= intrinsicWidth) as number[];
  const maximumPlannedWidth = RESPONSIVE_WIDTHS[RESPONSIVE_WIDTHS.length - 1];
  if (intrinsicWidth < maximumPlannedWidth && !widths.includes(intrinsicWidth)) widths.push(intrinsicWidth);
  return widths;
}

function cloudinaryUrl(
  asset: CloudinaryAssetMappingEntry,
  width: number,
  cloudName: string,
  apiSecret: string,
) {
  const deliveryPath = `c_limit,w_${width}/q_auto/f_webp/v${asset.version}/${asset.publicId}.${asset.format}`;
  const signature = signCloudinaryDeliveryPath(deliveryPath, apiSecret);
  return `https://res.cloudinary.com/${cloudName}/image/upload/s--${signature}--/${deliveryPath}`;
}

export function createCloudinaryResolvedImage(
  asset: CloudinaryAssetMappingEntry,
  role: PublicImageRole,
  cloudName: string,
  apiSecret: string,
): ResolvedPublicImage {
  if (!asset.publicId.startsWith("halfway-cafe/")) {
    throw new Error("Cloudinary asset is outside the halfway-cafe namespace");
  }
  if (!cloudName || !apiSecret) throw new Error("Cloudinary delivery credentials are required");
  const widths = responsiveWidths(asset.width);
  const targetWidth = roleWidth(widths, Math.min(ROLE_TARGETS[role], asset.width));
  return {
    src: cloudinaryUrl(asset, targetWidth, cloudName, apiSecret),
    srcSet: widths
      .map((width) => `${cloudinaryUrl(asset, width, cloudName, apiSecret)} ${width}w`)
      .join(", "),
    width: asset.width,
    height: asset.height,
    widths,
    provider: "cloudinary",
    objectPath: asset.objectPath,
  };
}

function roleWidth(widths: number[], target: number) {
  return widths.reduce((selected, width) => width <= target ? width : selected, widths[0]);
}

function decodeObjectPath(value: string) {
  try {
    return value.split("/").map((segment) => decodeURIComponent(segment)).join("/");
  } catch {
    return value;
  }
}

function sourceObjectPath(source: string, sourceHost: string) {
  if (!source.includes("://")) return decodeObjectPath(source.replace(/^\/+/, ""));
  try {
    const url = new URL(source);
    if (url.hostname !== sourceHost) return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/(.+)$/);
    return match ? decodeObjectPath(match[1]) : null;
  } catch {
    return null;
  }
}

function directUnsplashImage(source: string, role: PublicImageRole): ResolvedPublicImage {
  const sourceUrl = new URL(source);
  const widths = RESPONSIVE_WIDTHS.filter((width) => width <= ROLE_TARGETS[role]) as number[];
  const makeUrl = (width: number) => {
    const url = new URL(sourceUrl.origin + sourceUrl.pathname);
    const ixlib = sourceUrl.searchParams.get("ixlib");
    if (ixlib) url.searchParams.set("ixlib", ixlib);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    url.searchParams.set("fm", "auto");
    url.searchParams.set("q", "80");
    url.searchParams.set("w", String(width));
    return url.toString();
  };
  return {
    src: makeUrl(widths[widths.length - 1]),
    srcSet: widths.map((width) => `${makeUrl(width)} ${width}w`).join(", "),
    widths,
    provider: "unsplash",
  };
}

function fallbackImage(source: string): ResolvedPublicImage {
  if (source.startsWith("/")) return { src: source, provider: "local" };
  try {
    const url = new URL(source);
    const storageMatch = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/(.+)$/);
    if (storageMatch && url.hostname.endsWith(".supabase.co")) {
      return {
        src: `${url.origin}/storage/v1/object/public/${storageMatch[1]}`,
        provider: "supabase",
      };
    }
  } catch {
    return { src: source, provider: "external" };
  }
  return { src: source, provider: "external" };
}

export function createPublicImageResolver({
  mapping,
  cloudName,
  apiSecret,
}: {
  mapping: CloudinaryAssetMapping;
  cloudName: string;
  apiSecret: string;
}) {
  assertMapping(mapping);
  if (!cloudName || !apiSecret) throw new Error("Cloudinary delivery credentials are required");
  const byObjectPath = new Map(mapping.assets.map((asset) => [asset.objectPath, asset]));
  const byPublicId = new Map(mapping.assets.map((asset) => [asset.publicId, asset]));

  return (source: string | null | undefined, role: PublicImageRole): ResolvedPublicImage | null => {
    const normalizedSource = source?.trim();
    if (!normalizedSource) return null;
    const referencedPublicId = parseCloudinaryReference(normalizedSource);
    const referencedAsset = referencedPublicId ? byPublicId.get(referencedPublicId) : undefined;
    if (referencedAsset) {
      return createCloudinaryResolvedImage(referencedAsset, role, cloudName, apiSecret);
    }
    const objectPath = sourceObjectPath(normalizedSource, mapping.sourceHost);
    const asset = objectPath ? byObjectPath.get(objectPath) : undefined;
    if (asset) {
      return createCloudinaryResolvedImage(asset, role, cloudName, apiSecret);
    }
    if (normalizedSource.startsWith("https://images.unsplash.com/")) {
      return directUnsplashImage(normalizedSource, role);
    }
    return fallbackImage(normalizedSource);
  };
}
