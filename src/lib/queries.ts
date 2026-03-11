/* Supabase query helpers — used in Server Components */

import { createServerComponentClient } from "./supabase-server";

// ─── Categories ───

export async function getCategories() {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getCategories:", e);
    return [];
  }
}

// ─── Menu Items ───

export async function getMenuItems() {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getMenuItems:", e);
    return [];
  }
}

export async function getMenuItemsByCategory(category: string) {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("active", true)
      .eq("category", category)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getMenuItemsByCategory:", e);
    return [];
  }
}

export async function getFeaturedItems() {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("active", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getFeaturedItems:", e);
    return [];
  }
}

// ─── Opening Hours ───

export async function getOpeningHours() {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from("opening_hours")
      .select("*")
      .order("day_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getOpeningHours:", e);
    return [];
  }
}

// ─── Gallery Images ───

export async function getGalleryImages() {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("getGalleryImages:", e);
    return [];
  }
}

// ─── Site Settings ───

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) throw error;
    if (!data) return {};

    return Object.fromEntries(data.map((row) => [row.key, row.value ?? ""]));
  } catch (e) {
    console.error("getSiteSettings:", e);
    return {};
  }
}
