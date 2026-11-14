import "server-only";

import {
  resolvePublicMenuImageCore,
  setBreakfastOneCanaryReference,
  stableMenuItemId,
} from "./public-menu-image-core";
import {
  resolvePublicImage,
  resolveVerifiedBreakfastPublicFallback,
} from "./public-images.server";
import { createPublicServerClient } from "./supabase-public";
import type {
  CloudinaryRegistryAsset,
  PublicImageRole,
  PublicMenuImageDiagnostic,
  ResolvedPublicImage,
} from "../types/public-image";

async function findReadyImageAsset(publicId: string): Promise<CloudinaryRegistryAsset | null> {
  const supabase = createPublicServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("resolve_public_image_asset", {
    p_public_id: publicId,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return row && typeof row === "object" ? (row as CloudinaryRegistryAsset) : null;
}

function logImageDiagnostic(event: PublicMenuImageDiagnostic) {
  console.error("[public-menu-image]", event);
}

export async function resolvePublicMenuImage(
  source: string | null | undefined,
  role: PublicImageRole,
  itemId: string | null,
) {
  const normalizedSource = source?.trim();
  if (
    normalizedSource &&
    setBreakfastOneCanaryReference({ itemId, source: normalizedSource })
  ) {
    try {
      const mappedImage = resolvePublicImage(normalizedSource, role);
      if (mappedImage?.provider === "cloudinary") {
        return { kind: "cloudinary" as const, image: mappedImage };
      }
    } catch {
      // Continue through the registry resolver, which preserves the legacy source on failure.
    }
  }

  return resolvePublicMenuImageCore({
    itemId,
    source,
    role,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() ?? "",
    lookup: findReadyImageAsset,
    fallback: resolveVerifiedBreakfastPublicFallback,
    diagnostic: logImageDiagnostic,
  });
}

/**
 * Resolves a menu item image for rendering: Cloudinary logical references come
 * from the signed registry, while legacy URLs are passed through unchanged.
 * The raw source field is removed so only the resolved delivery URL is sent to
 * the client.
 */
export async function resolveMenuItemForDisplay<
  T extends object,
  K extends keyof T & string,
>(
  item: T,
  sourceField: K,
  role: PublicImageRole,
): Promise<Omit<T, K> & { resolvedImage: ResolvedPublicImage | null }> {
  const sourceValue = item[sourceField];
  const source = typeof sourceValue === "string" ? sourceValue : null;
  const resolution = await resolvePublicMenuImage(source, role, stableMenuItemId(item));

  const withoutSource = { ...item } as Omit<T, K> & Partial<Pick<T, K>>;
  delete withoutSource[sourceField];

  const resolvedImage: ResolvedPublicImage | null =
    resolution.kind === "cloudinary"
      ? resolution.image
      : resolution.kind === "legacy"
        ? { src: resolution.source, provider: "external" }
        : null;

  return { ...withoutSource, resolvedImage };
}
