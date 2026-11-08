export type PublicImageProvider =
  | "cloudinary"
  | "unsplash"
  | "supabase"
  | "external"
  | "local";

export type PublicImageRole = "logo" | "thumbnail" | "card" | "content" | "hero";

export interface CloudinaryAssetMappingEntry {
  objectPath: string;
  publicId: string;
  version: number;
  format: string;
  width: number;
  height: number;
}

export interface CloudinaryAssetMapping {
  schemaVersion: 1;
  manifestSha256: string;
  sourceHost: string;
  assets: CloudinaryAssetMappingEntry[];
}

export interface ResolvedPublicImage {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
  widths?: number[];
  provider: PublicImageProvider;
  objectPath?: string;
}

export interface CloudinaryRegistryAsset {
  public_id: string;
  version: number;
  format: "jpeg" | "jpg" | "png" | "webp";
  width: number;
  height: number;
}

export type PublicMenuImageDiagnosticStage =
  | "invalid-reference"
  | "configuration-missing"
  | "registry-missing"
  | "registry-invalid"
  | "registry-error";

export interface PublicMenuImageDiagnostic {
  stage: PublicMenuImageDiagnosticStage;
  publicId?: string;
}

export type PublicMenuImageResolution =
  | { kind: "none" }
  | { kind: "legacy"; source: string }
  | { kind: "cloudinary"; image: ResolvedPublicImage | null };
