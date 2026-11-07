"use server";

import { requireHalfwayAdmin } from "@/lib/admin-auth.server";
import { applyImageIntent } from "@/lib/admin-image-core";
import { describeAdminImage } from "@/lib/admin-image-description.server";
import { buildGalleryImageValues, buildImageSettingChanges } from "@/lib/admin-write-core";
import type {
  AdminCategoryInput,
  AdminCategoryRow,
  AdminGalleryRow,
  AdminMenuFormInput,
  AdminMenuItemRow,
  AdminSettingsData,
} from "@/types/admin-data";
import type { AdminImageIntent } from "@/types/admin-image";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_SETTING_KEYS = new Set([
  "hero_image_web",
  "hero_image_mobile",
  "delivery_ubereats_logo",
  "delivery_justeat_logo",
  "delivery_deliveroo_logo",
]);
const SETTING_KEYS = new Set([
  ...IMAGE_SETTING_KEYS,
  "social_instagram",
  "social_facebook",
  "social_tiktok",
  "delivery_ubereats",
  "delivery_justeat",
  "delivery_deliveroo",
]);

function requiredText(value: unknown, label: string, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > maxLength) throw new Error(`${label} is invalid`);
  return text;
}

function optionalText(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > maxLength) throw new Error("Text value is too long");
  return text || null;
}

function validId(value: string, label = "ID") {
  if (!UUID_PATTERN.test(value)) throw new Error(`${label} is invalid`);
  return value;
}

function boundedInteger(value: unknown, minimum: number, maximum: number) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error("Numeric value is out of range");
  }
  return number;
}

function validatedPrice(value: unknown, required: boolean) {
  if (!required && (value === null || value === undefined || value === "")) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 9999.99 || (required && number <= 0)) {
    throw new Error("Price is invalid");
  }
  return Number(number.toFixed(2));
}

async function safeMenuRow(row: Record<string, unknown>): Promise<AdminMenuItemRow> {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: typeof row.description === "string" ? row.description : null,
    price: Number(row.price ?? 0),
    price_roll: row.price_roll === null ? null : Number(row.price_roll ?? 0),
    price_sandwich: row.price_sandwich === null ? null : Number(row.price_sandwich ?? 0),
    price_baguette: row.price_baguette === null ? null : Number(row.price_baguette ?? 0),
    category: String(row.category ?? ""),
    dietary: Array.isArray(row.dietary) ? row.dietary.filter((value): value is string => typeof value === "string") : [],
    available: String(row.available ?? "all-day"),
    featured: row.featured === true,
    active: row.active !== false,
    sort_order: Number(row.sort_order ?? 0),
    image: await describeAdminImage(typeof row.image_url === "string" ? row.image_url : null, "thumbnail"),
  };
}

export async function listAdminMenuItems(): Promise<AdminMenuItemRow[]> {
  const { supabase } = await requireHalfwayAdmin();
  const { data, error } = await supabase.from("menu_items").select("*").order("sort_order");
  if (error) throw new Error("Unable to load menu items");
  return Promise.all((data ?? []).map((row) => safeMenuRow(row)));
}

export async function getAdminMenuItem(id: string): Promise<AdminMenuItemRow | null> {
  validId(id);
  const { supabase } = await requireHalfwayAdmin();
  const { data, error } = await supabase.from("menu_items").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Unable to load the menu item");
  return data ? safeMenuRow(data) : null;
}

export async function listAdminCategoryOptions() {
  const { supabase } = await requireHalfwayAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error("Unable to load categories");
  return (data ?? []).map((row) => ({ value: String(row.slug), label: String(row.name) }));
}

export async function saveAdminMenuItem(input: AdminMenuFormInput) {
  const { supabase } = await requireHalfwayAdmin();
  const dietary = Array.isArray(input.dietary)
    ? input.dietary.filter((value) => ["vegetarian", "vegan", "gluten-free"].includes(value))
    : [];
  let payload: Record<string, unknown> = {
    name: requiredText(input.name, "Name", 160),
    description: optionalText(input.description, 2_000),
    price: validatedPrice(input.price, true),
    price_roll: validatedPrice(input.price_roll, false),
    price_sandwich: validatedPrice(input.price_sandwich, false),
    price_baguette: validatedPrice(input.price_baguette, false),
    category: requiredText(input.category, "Category", 80),
    available: requiredText(input.available, "Availability", 40),
    active: input.active === true,
    featured: input.featured === true,
    dietary,
  };
  payload = applyImageIntent(payload, "image_url", input.imageIntent);

  if (input.id) {
    const id = validId(input.id);
    const { error } = await supabase.from("menu_items").update(payload).eq("id", id);
    if (error) throw new Error("Unable to update the menu item");
    return { id };
  }
  const { data, error } = await supabase.from("menu_items").insert(payload).select("id").single();
  if (error || !data) throw new Error("Unable to create the menu item");
  return { id: String(data.id) };
}

export async function setAdminMenuFlag(id: string, field: "active" | "featured", value: boolean) {
  validId(id);
  if (field !== "active" && field !== "featured") throw new Error("Unsupported menu field");
  const { supabase } = await requireHalfwayAdmin();
  const { error } = await supabase.from("menu_items").update({ [field]: value === true }).eq("id", id);
  if (error) throw new Error("Unable to update the menu item");
}

export async function deleteAdminMenuItem(id: string) {
  validId(id);
  const { supabase } = await requireHalfwayAdmin();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error("Unable to delete the menu item");
}

export async function listAdminCategories(): Promise<AdminCategoryRow[]> {
  const { supabase } = await requireHalfwayAdmin();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw new Error("Unable to load categories");
  return Promise.all((data ?? []).map(async (row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    sort_order: Number(row.sort_order ?? 0),
    active: row.active !== false,
    image: await describeAdminImage(typeof row.image_url === "string" ? row.image_url : null, "thumbnail"),
  })));
}

export async function saveAdminCategory(input: AdminCategoryInput) {
  const { supabase } = await requireHalfwayAdmin();
  const slug = requiredText(input.slug, "Slug", 80).toLowerCase();
  if (!SLUG_PATTERN.test(slug)) throw new Error("Slug is invalid");
  let payload: Record<string, unknown> = {
    name: requiredText(input.name, "Name", 120),
    slug,
    sort_order: boundedInteger(input.sort_order, 0, 10_000),
    active: input.active === true,
  };
  payload = applyImageIntent(payload, "image_url", input.imageIntent);
  if (input.id) {
    const id = validId(input.id);
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) throw new Error("Unable to update the category");
    return { id };
  }
  const { data, error } = await supabase.from("categories").insert(payload).select("id").single();
  if (error || !data) throw new Error("Unable to create the category");
  return { id: String(data.id) };
}

export async function deleteAdminCategory(id: string) {
  validId(id);
  const { supabase } = await requireHalfwayAdmin();
  const { count, error: countError } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category", (await supabase.from("categories").select("slug").eq("id", id).single()).data?.slug ?? "");
  if (countError) throw new Error("Unable to verify category usage");
  if ((count ?? 0) > 0) throw new Error("Move menu items out of this category before deleting it");
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error("Unable to delete the category");
}

export async function listAdminGallery(): Promise<AdminGalleryRow[]> {
  const { supabase } = await requireHalfwayAdmin();
  const { data, error } = await supabase.from("gallery_images").select("*").order("sort_order");
  if (error) throw new Error("Unable to load gallery images");
  return Promise.all((data ?? []).map(async (row) => ({
    id: String(row.id),
    persisted: true,
    alt_text: String(row.alt_text ?? ""),
    sort_order: Number(row.sort_order ?? 0),
    active: row.active !== false,
    image: await describeAdminImage(typeof row.url === "string" ? row.url : null, "thumbnail"),
    imageIntent: { kind: "unchanged" as const },
  })));
}

export async function saveAdminGallery(rows: AdminGalleryRow[], deletedIds: string[]) {
  const { supabase } = await requireHalfwayAdmin();
  if (!Array.isArray(rows) || rows.length > 100 || !Array.isArray(deletedIds)) {
    throw new Error("Gallery batch is invalid");
  }
  const ids = rows.map((row) => validId(row.id, "Gallery ID"));
  deletedIds.forEach((id) => validId(id, "Deleted gallery ID"));
  const { data: existing, error: existingError } = ids.length
    ? await supabase.from("gallery_images").select("id, url").in("id", ids)
    : { data: [], error: null };
  if (existingError) throw new Error("Unable to verify gallery images");
  const existingById = new Map((existing ?? []).map((row) => [String(row.id), String(row.url)]));

  const imageValues = new Map(buildGalleryImageValues(rows, existingById).map((row) => [row.id, row.url]));
  const payload = rows.map((row) => {
    return {
      id: row.id,
      url: imageValues.get(row.id),
      alt_text: optionalText(row.alt_text, 500),
      sort_order: boundedInteger(row.sort_order, 0, 10_000),
      active: row.active === true,
    };
  });
  const { error } = await supabase.rpc("save_gallery_atomic", {
    p_rows: payload,
    p_delete_ids: deletedIds,
  });
  if (error) throw new Error("The atomic gallery update failed; no changes were saved");
}

export async function getAdminSettings(): Promise<AdminSettingsData> {
  const { supabase } = await requireHalfwayAdmin();
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw new Error("Unable to load site settings");
  const values: Record<string, string> = {};
  const images: AdminSettingsData["images"] = {};
  for (const row of data ?? []) {
    if (!SETTING_KEYS.has(row.key)) continue;
    if (IMAGE_SETTING_KEYS.has(row.key)) {
      images[row.key] = await describeAdminImage(typeof row.value === "string" ? row.value : null, row.key.startsWith("hero_") ? "hero" : "logo");
    } else {
      values[row.key] = typeof row.value === "string" ? row.value : "";
    }
  }
  for (const key of IMAGE_SETTING_KEYS) {
    images[key] ??= { hasImage: false, label: "No image", provider: null, preview: null };
  }
  return { values, images };
}

export async function saveAdminSettings(
  values: Record<string, string>,
  imageIntents: Record<string, AdminImageIntent>,
) {
  const { supabase } = await requireHalfwayAdmin();
  const payload: { key: string; value: string | null; updated_at: string }[] = [];
  const timestamp = new Date().toISOString();
  for (const [key, value] of Object.entries(values)) {
    if (!SETTING_KEYS.has(key) || IMAGE_SETTING_KEYS.has(key)) throw new Error("Unsupported setting key");
    const normalized = optionalText(value, 2_000) ?? "";
    if (normalized && !/^https:\/\//i.test(normalized)) throw new Error("Settings URLs must use HTTPS");
    payload.push({ key, value: normalized, updated_at: timestamp });
  }
  for (const [key] of Object.entries(imageIntents)) {
    if (!IMAGE_SETTING_KEYS.has(key)) throw new Error("Unsupported image setting key");
  }
  payload.push(...buildImageSettingChanges(imageIntents).map((row) => ({ ...row, updated_at: timestamp })));
  if (payload.length === 0) return;
  const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "key" });
  if (error) throw new Error("Unable to save site settings");
}
