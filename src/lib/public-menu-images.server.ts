import "server-only";

import { resolvePublicMenuImageCore } from "./public-menu-image-core";
import { createServerComponentClient } from "./supabase-server";
import type {
  CloudinaryRegistryAsset,
  PublicImageRole,
  PublicMenuImageDiagnostic,
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
