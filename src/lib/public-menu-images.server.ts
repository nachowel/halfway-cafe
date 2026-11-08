import "server-only";

import { resolvePublicMenuImageCore } from "./public-menu-image-core";
import { createServerComponentClient } from "./supabase-server";
import type {
  CloudinaryRegistryAsset,
  PublicImageRole,
  PublicMenuImageDiagnostic,
  ResolvedPublicImage,
} from "../types/public-image";

async function findReadyImageAsset(publicId: string): Promise<CloudinaryRegistryAsset | null> {
  const supabase = await createServerComponentClient();
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
) {
  return resolvePublicMenuImageCore({
    source,
    role,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() ?? "",
    lookup: findReadyImageAsset,
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
  const resolution = await resolvePublicMenuImage(source, role);

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
