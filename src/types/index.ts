/* Halfway Cafe — Shared TypeScript types */
import type { ResolvedPublicImage } from "./public-image";

// ─── Menu ───

/** Category slugs are now dynamic — sourced from the `categories` table */
export type MenuCategory = string;

export type Allergen =
  | 'celery'
  | 'cereals' // cereals containing gluten
  | 'crustaceans'
  | 'eggs'
  | 'fish'
  | 'lupin'
  | 'milk'
  | 'molluscs'
  | 'mustard'
  | 'nuts'
  | 'peanuts'
  | 'sesame'
  | 'soybeans'
  | 'sulphites';

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in GBP
  price_roll?: number | null;
  price_sandwich?: number | null;
  price_baguette?: number | null;
  category: MenuCategory;
  image?: string;
  resolvedImage?: ResolvedPublicImage | null;
  allergens: Allergen[];
  dietary: DietaryTag[];
  available: boolean;
  featured: boolean;
}

// ─── Opening Hours ───

export interface OpeningHours {
  day: string;
  open: string;  // e.g. "07:00"
  close: string; // e.g. "21:00"
  closed: boolean;
}

export interface OpenStatus {
  isOpen: boolean;
  message: string;
}

// ─── Gallery ───

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}
