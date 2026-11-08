export type PublicImageRole = "logo" | "thumbnail" | "card" | "content" | "hero";

export interface ResolvedPublicImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  widths: number[];
  provider: "cloudinary";
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
