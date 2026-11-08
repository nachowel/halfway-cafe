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

