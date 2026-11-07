import "server-only";

import mappingJson from "../data/cloudinary-assets.v1.json";
import { buildAssetPickerRecords } from "./admin-image-picker-core";
import { createCloudinaryResolvedImage } from "./public-image-core";
import { listReadyImageAssets } from "./image-asset-registry.server";
import type { CloudinaryAssetMapping } from "../types/public-image";
import type { SupabaseClient } from "@supabase/supabase-js";

const mapping = mappingJson as CloudinaryAssetMapping;

export async function listAdminImagePickerItems(supabase: SupabaseClient) {
  if (mapping.assets.length !== 101) throw new Error("Approved Cloudinary mapping is incomplete");
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? "";
  const dynamic = await listReadyImageAssets(supabase);
  return buildAssetPickerRecords(mapping.assets, dynamic).map((record) => ({
    reference: record.reference,
    label: record.label,
    source: record.source,
    width: record.width,
    height: record.height,
    preview: createCloudinaryResolvedImage(
      {
        objectPath: record.reference,
        publicId: record.publicId,
        version: record.version,
        format: record.format,
        width: record.width,
        height: record.height,
      },
      "thumbnail",
      cloudName,
      apiSecret,
    ),
  }));
}
