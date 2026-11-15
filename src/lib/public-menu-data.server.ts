/// <reference types="react/canary" />

import "server-only";

import { cache } from "react";
import { createRequestScopedMenuDataLoader } from "./public-menu-data-cache";
import { createLivePublicServerClient } from "./supabase-public";

function requireLivePublicServerClient() {
  const supabase = createLivePublicServerClient();

  if (!supabase) {
    throw new Error("Supabase public environment is not configured.");
  }

  return supabase;
}

async function loadPublicCategories() {
  const supabase = requireLivePublicServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function loadPublicMenuItemsByCategory(categorySlug: string) {
  const supabase = requireLivePublicServerClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("active", true)
    .eq("category", categorySlug)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function loadPublicMenuItemCountRows() {
  const supabase = requireLivePublicServerClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, category")
    .eq("active", true);

  if (error) throw error;
  return data ?? [];
}

export const getPublicCategoriesForRequest = createRequestScopedMenuDataLoader(
  cache,
  loadPublicCategories,
);

export const getPublicMenuItemsByCategoryForRequest =
  createRequestScopedMenuDataLoader(cache, loadPublicMenuItemsByCategory);

export const getPublicMenuItemCountRowsForRequest =
  createRequestScopedMenuDataLoader(cache, loadPublicMenuItemCountRows);
