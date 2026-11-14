import "server-only";

import { buildQrMenuData, type QrMenuCategory } from "./qr-menu-data";
import { createPublicServerClient } from "./supabase-public";

export type QrMenuDataResult =
  | { status: "ready"; categories: QrMenuCategory[] }
  | { status: "error" };

export async function getQrMenuData(): Promise<QrMenuDataResult> {
  try {
    const supabase = createPublicServerClient();

    if (!supabase) {
      return { status: "error" };
    }

    const [categoriesResult, productsResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, sort_order, active")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select(
          "id, name, description, price, price_roll, price_sandwich, price_baguette, category, sort_order, active",
        )
        .eq("active", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (categoriesResult.error || productsResult.error) {
      console.error("QR menu data unavailable: Supabase query failed.");
      return { status: "error" };
    }

    const categories = buildQrMenuData(
      categoriesResult.data ?? [],
      productsResult.data ?? [],
    );
    const productCount = categories.reduce(
      (count, category) => count + category.products.length,
      0,
    );

    if (categories.length === 0 || productCount === 0) {
      console.error("QR menu data unavailable: no active menu records were returned.");
      return { status: "error" };
    }

    return { status: "ready", categories };
  } catch {
    console.error("QR menu data unavailable: menu validation failed.");
    return { status: "error" };
  }
}
