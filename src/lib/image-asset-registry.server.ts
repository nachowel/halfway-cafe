import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  BeginImageAssetInput,
  ImageAssetRegistryRow,
  RemoteImageAsset,
} from "./admin-image-upload-service";

function oneRow(data: unknown): ImageAssetRegistryRow {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") throw new Error("Image registry returned no row");
  return row as ImageAssetRegistryRow;
}

export async function beginImageAsset(
  supabase: SupabaseClient,
  input: BeginImageAssetInput,
): Promise<ImageAssetRegistryRow> {
  const { data, error } = await supabase.rpc("begin_image_asset", {
    p_public_id: input.publicId,
    p_format: input.format,
    p_width: input.width,
    p_height: input.height,
    p_byte_size: input.byteSize,
    p_source_sha256: input.sourceSha256,
    p_original_filename: input.originalFilename,
    p_mime_type: input.mimeType,
    p_idempotency_key: input.idempotencyKey,
  });
  if (error) throw error;
  return oneRow(data);
}

export async function finalizeImageAsset(
  supabase: SupabaseClient,
  id: string,
  remote: RemoteImageAsset,
): Promise<ImageAssetRegistryRow> {
  const { data, error } = await supabase.rpc("finalize_image_asset", {
    p_id: id,
    p_asset_id: remote.assetId,
    p_version: remote.version,
    p_format: remote.format === "jpg" ? "jpeg" : remote.format,
    p_width: remote.width,
    p_height: remote.height,
    p_byte_size: remote.bytes,
  });
  if (error) throw error;
  return oneRow(data);
}

export async function failImageAsset(
  supabase: SupabaseClient,
  id: string,
  errorCode: string,
): Promise<void> {
  const { error } = await supabase.rpc("fail_image_asset", {
    p_id: id,
    p_error_code: errorCode,
  });
  if (error) throw error;
}

export async function consumeAdminImageRateLimit(
  supabase: SupabaseClient,
  action: "picker" | "reconcile",
): Promise<void> {
  const { error } = await supabase.rpc("consume_admin_image_rate_limit", { p_action: action });
  if (error) throw error;
}

export async function listReadyImageAssets(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("image_assets")
    .select("id, public_id, asset_id, version, format, width, height, byte_size, source_sha256, original_filename, mime_type, status, created_at")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as (ImageAssetRegistryRow & { created_at: string })[];
}

export async function findReadyImageAsset(supabase: SupabaseClient, publicId: string) {
  const { data, error } = await supabase.rpc("resolve_public_image_asset", {
    p_public_id: publicId,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as {
    public_id: string;
    version: number;
    format: "jpeg" | "png" | "webp";
    width: number;
    height: number;
  } | null;
}

export async function findPendingImageAsset(supabase: SupabaseClient, publicId: string) {
  const { data, error } = await supabase
    .from("image_assets")
    .select("id, public_id, asset_id, version, format, width, height, byte_size, source_sha256, original_filename, mime_type, status")
    .eq("public_id", publicId)
    .eq("status", "pending")
    .maybeSingle();
  if (error) throw error;
  return data as ImageAssetRegistryRow | null;
}
