import type { AdminImageIntent } from "@/lib/admin-image-core";
import type { ResolvedPublicImage } from "./public-image";

export type { AdminImageIntent };

export interface SafeAdminImage {
  hasImage: boolean;
  label: string;
  provider: ResolvedPublicImage["provider"] | null;
  preview: ResolvedPublicImage | null;
}

export interface AdminImagePickerItem {
  reference: string;
  label: string;
  source: "migration" | "admin";
  width: number;
  height: number;
  preview: ResolvedPublicImage;
}
