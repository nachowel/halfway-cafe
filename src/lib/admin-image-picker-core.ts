import { createCloudinaryReference } from "./admin-image-core.ts";
import type { CloudinaryAssetMappingEntry } from "../types/public-image.ts";

export interface DynamicPickerAsset {
  public_id: string;
  original_filename: string;
  version: number | null;
  format: string;
  width: number;
  height: number;
  status: string;
}

export interface AssetPickerRecord {
  reference: string;
  label: string;
  publicId: string;
  version: number;
  format: string;
  width: number;
  height: number;
  source: "migration" | "admin";
}

function filenameLabel(value: string) {
  const name = value.replace(/\\/g, "/").split("/").pop() ?? "Image";
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Image";
}

export function buildAssetPickerRecords(
  mapped: CloudinaryAssetMappingEntry[],
  dynamic: DynamicPickerAsset[],
): AssetPickerRecord[] {
  const staticRecords = mapped.map((asset) => ({
    reference: createCloudinaryReference(asset.publicId),
    label: filenameLabel(asset.objectPath),
    publicId: asset.publicId,
    version: asset.version,
    format: asset.format,
    width: asset.width,
    height: asset.height,
    source: "migration" as const,
  }));
  const dynamicRecords = dynamic
    .filter((asset) => asset.status === "ready" && asset.public_id.startsWith("halfway-cafe/admin/"))
    .map((asset) => ({
      reference: createCloudinaryReference(asset.public_id),
      label: filenameLabel(asset.original_filename),
      publicId: asset.public_id,
      version: asset.version ?? 0,
      format: asset.format,
      width: asset.width,
      height: asset.height,
      source: "admin" as const,
    }));
  return [...staticRecords, ...dynamicRecords];
}
