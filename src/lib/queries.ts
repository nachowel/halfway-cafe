/* Supabase query helpers — used in Server Components */

import "server-only";

import { createPublicServerClient } from "./supabase-public";
import { markPublicDataUncacheable } from "./public-cache";
import { toSiteSettingsMap } from "./site-settings";

// ─── Categories ───

export async function getCategories() {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) throw new Error("Supabase public environment is not configured.");
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    markPublicDataUncacheable("getCategories", e);
    return [];
  }
}

// ─── Menu Items ───

export async function getMenuItems() {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) throw new Error("Supabase public environment is not configured.");
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    markPublicDataUncacheable("getMenuItems", e);
    return [];
  }
}

export async function getMenuItemsByCategory(category: string) {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) throw new Error("Supabase public environment is not configured.");
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("active", true)
      .eq("category", category)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    markPublicDataUncacheable("getMenuItemsByCategory", e);
    return [];
  }
}

export async function getFeaturedItems() {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) throw new Error("Supabase public environment is not configured.");
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("active", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    markPublicDataUncacheable("getFeaturedItems", e);
    return [];
  }
}

// ─── Opening Hours ───

export async function getOpeningHours() {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) throw new Error("Supabase public environment is not configured.");
    const { data, error } = await supabase
      .from("opening_hours")
      .select("*")
      .order("day_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    markPublicDataUncacheable("getOpeningHours", e);
    return [];
  }
}

// ─── Gallery Images ───

export async function getGalleryImages() {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) throw new Error("Supabase public environment is not configured.");
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    markPublicDataUncacheable("getGalleryImages", e);
    return [];
  }
}

// ─── Site Settings ───

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) throw new Error("Supabase public environment is not configured.");
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) throw error;
    if (!data) return {};

    return toSiteSettingsMap(data);
  } catch (e) {
    markPublicDataUncacheable("getSiteSettings", e);
    return {};
  }
}

export async function getSiteSettingsByKeys(keys: string[]): Promise<Record<string, string>> {
  try {
    const supabase = createPublicServerClient();
    if (!supabase) throw new Error("Supabase public environment is not configured.");
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", keys);

    if (error) throw error;
    return toSiteSettingsMap(data ?? []);
  } catch (e) {
    markPublicDataUncacheable("getSiteSettingsByKeys", e);
    return {};
  }
}
