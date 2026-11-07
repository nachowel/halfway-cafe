import type { AdminImageIntent, SafeAdminImage } from "./admin-image";

export interface AdminMenuItemRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
  price_roll: number | null;
  price_sandwich: number | null;
  price_baguette: number | null;
  category: string;
  dietary: string[];
  available: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  image: SafeAdminImage;
}

export interface AdminMenuFormInput {
  id: string | null;
  name: string;
  description: string;
  price: number;
  price_roll: number | null;
  price_sandwich: number | null;
  price_baguette: number | null;
  category: string;
  available: string;
  active: boolean;
  featured: boolean;
  dietary: string[];
  imageIntent: AdminImageIntent;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
  image: SafeAdminImage;
}

export interface AdminCategoryInput {
  id: string | null;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
  imageIntent: AdminImageIntent;
}

export interface AdminGalleryRow {
  id: string;
  persisted: boolean;
  alt_text: string;
  sort_order: number;
  active: boolean;
  image: SafeAdminImage;
  imageIntent: AdminImageIntent;
}

export interface AdminSettingsData {
  values: Record<string, string>;
  images: Record<string, SafeAdminImage>;
}
