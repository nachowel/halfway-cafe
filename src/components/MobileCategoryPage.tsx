"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  X,
} from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import { createOptionalClientComponentClient } from "@/lib/supabase";

type CategoryRow = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

type MenuItemRow = {
  id: string;
  name?: string | null;
  description?: string | null;
  price?: number | string | null;
  price_roll?: number | string | null;
  price_sandwich?: number | string | null;
  price_baguette?: number | string | null;
  image_url?: string | null;
  category?: string | null;
  active?: boolean | null;
  sort_order?: number | null;
};

type CountRow = {
  id: string;
  category?: string | null;
};

function formatCategoryLabel(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPrice(value: number | string | null | undefined) {
  const numericValue =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (Number.isNaN(numericValue)) {
    return "£0.00";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(numericValue);
}

function getSandwichExtraFormatPrices(item: MenuItemRow) {
  return [
    item.price_roll != null ? { label: "Roll", value: item.price_roll } : null,
    item.price_baguette != null
      ? { label: "Baguette", value: item.price_baguette }
      : null,
  ].filter(
    (
      variant
    ): variant is { label: "Roll" | "Baguette"; value: number | string } => variant !== null
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-3 pb-3 pt-3">
      <div className="flex flex-col gap-[10px]">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[100px] items-center gap-4 overflow-hidden rounded-2xl bg-white px-[18px] py-4"
          style={{
            border: "0.5px solid rgba(0,0,0,0.07)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          <div className="h-[100px] w-[110px] shrink-0 animate-pulse rounded-2xl bg-gray-200" />
          <div className="flex-1 animate-pulse bg-gray-100" />
        </div>
      ))}
      </div>
    </div>
  );
}

export default function MobileCategoryPage({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAllergyNotice, setShowAllergyNotice] = useState(false);
  const [previewItem, setPreviewItem] = useState<MenuItemRow | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [countRows, setCountRows] = useState<CountRow[]>([]);

  useEffect(() => {
    let isMounted = true;
    const supabase = createOptionalClientComponentClient("Mobile category page");

    if (!supabase) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const client = supabase;

    async function loadCategoryData() {
      setLoading(true);

      const [categoriesRes, menuItemsRes, countsRes] = await Promise.all([
        client
          .from("categories")
          .select("id, name, slug")
          .eq("active", true)
          .order("sort_order", { ascending: true }),
        client
          .from("menu_items")
          .select(
            "id, name, description, price, price_roll, price_sandwich, price_baguette, image_url, category, active, sort_order"
          )
          .eq("active", true)
          .eq("category", categorySlug)
          .order("sort_order", { ascending: true }),
        client
          .from("menu_items")
          .select("id, category")
          .eq("active", true),
      ]);

      if (!isMounted) {
        return;
      }

      setCategories(categoriesRes.error ? [] : ((categoriesRes.data ?? []) as CategoryRow[]));
      setItems(menuItemsRes.error ? [] : ((menuItemsRes.data ?? []) as MenuItemRow[]));
      setCountRows(countsRes.error ? [] : ((countsRes.data ?? []) as CountRow[]));
      setLoading(false);
    }

    loadCategoryData().catch(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  useEffect(() => {
    if (!showAllergyNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowAllergyNotice(false);
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [showAllergyNotice]);

  useEffect(() => {
    if (!previewItem) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsPreviewVisible(true);
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, [previewItem]);

  const activeCategory = categories.find((category) => category.slug === categorySlug) ?? null;
  const categoryName = activeCategory?.name ?? formatCategoryLabel(categorySlug);
  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) => (item.name ?? "").toLowerCase().includes(normalizedSearch));
  }, [items, searchTerm]);
  const itemCount = useMemo(
    () => countRows.filter((row) => row.category === categorySlug).length,
    [categorySlug, countRows]
  );

  function openPreview(item: MenuItemRow) {
    if (!item.image_url) {
      return;
    }

    setPreviewItem(item);
  }

  function closePreview() {
    setIsPreviewVisible(false);

    window.setTimeout(() => {
      setPreviewItem(null);
    }, 150);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] md:hidden">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#E8E2D9] bg-[#FAF8F5] px-4">
        <Link href="/menu" className="flex w-10 items-center justify-start no-underline text-[#1A1A1A]">
          <ChevronLeft size={22} strokeWidth={1.5} />
        </Link>

        <p className="truncate px-3 text-center font-playfair text-[18px] font-bold text-[#1A1A1A]">
          {categoryName}
        </p>

        <div className="w-10" />
      </header>

      <main className="pb-[92px]">
        <div className="relative mx-4 mt-3">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Search ${categoryName}...`}
            className="h-[42px] w-full rounded-xl border border-[#ECE8E2] bg-[#F7F5F2] pl-9 pr-4 font-inter text-[14px] text-[#333333] outline-none placeholder:text-[#999999]"
          />
        </div>

        <div className="mx-4 mb-1 mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-inter text-[15px] font-bold text-[#1A1A1A]">
                {categoryName}
              </span>
              <span className="ml-[5px] shrink-0 font-inter text-xs text-[#999999]">
                · {itemCount} items
              </span>
              <span
                className="shrink-0 rounded-md px-[7px] py-[2px] font-inter text-[10.5px] text-[#A05A20]"
                style={{ background: "#FFF8F0", border: "0.5px solid #F0C090" }}
              >
                Served daily
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAllergyNotice(true)}
            className="flex shrink-0 items-center gap-1 rounded-[20px] bg-[#FFF8F0] px-[10px] py-[4px] font-inter text-[11px] text-[#A05A20]"
            style={{ border: "0.5px solid #F0C090" }}
          >
            <Info size={12} strokeWidth={1.75} />
            <span>Allergy info</span>
          </button>
        </div>

        {categorySlug === "breakfast" ? (
          <p className="mx-4 mb-[6px] mt-[6px] font-inter text-[13px] text-[#6B6B6B]">
            All set breakfasts include tea or coffee and 2 toast or bread.
          </p>
        ) : null}

        {loading ? (
          <LoadingSkeleton />
        ) : filteredItems.length > 0 ? (
          <div className="px-3 pb-3 pt-3">
            <div className="flex flex-col gap-[10px]">
            {filteredItems.map((item) => {
              const sandwichExtraFormatPrices = getSandwichExtraFormatPrices(item);

              return (
                <div
                  key={item.id}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white px-[18px] py-4 transition duration-150 ease-out active:scale-[0.98] active:bg-[#FAF8F5]"
                  style={{
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.05), 0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openPreview(item)}
                    className="relative flex h-[100px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F5F5F5]"
                    aria-label={`Preview ${item.name ?? "menu item"}`}
                  >
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name ? `${item.name} — Halfway Cafe Sidcup` : "Menu item at Halfway Cafe Sidcup"}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🍽</span>
                    )}
                  </button>

                  <div className="item-body flex min-w-0 flex-1 flex-col justify-center">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className="item-name min-w-0 flex-1 font-inter text-[15px] font-semibold leading-snug text-[#1A1A1A]"
                          style={{ letterSpacing: "-0.1px" }}
                        >
                          {item.name ?? "Menu item"}
                        </p>
                        <p className="item-price shrink-0 font-inter text-[16px] font-bold text-[#D45E1A]">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      {item.description?.trim() ? (
                        <p
                          className="item-desc mt-[3px] overflow-hidden font-inter text-[14px] leading-[1.4] text-[#6B6B6B]"
                          style={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: sandwichExtraFormatPrices.length > 0 ? 1 : 2,
                          }}
                        >
                          {item.description.trim()}
                        </p>
                      ) : null}

                      {sandwichExtraFormatPrices.length > 0 ? (
                        <div className="mt-[7px] flex flex-wrap gap-x-3 gap-y-1">
                          {sandwichExtraFormatPrices.map((variant) => (
                            <span
                              key={variant.label}
                              className="inline-flex items-center gap-1 font-inter text-[12px] leading-4 text-[#7A6A5C]"
                            >
                              <span className="font-medium text-[#8A7969]">{variant.label}</span>
                              <span className="font-semibold text-[#D45E1A]">
                                {formatPrice(variant.value)}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-center justify-end">
                      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#F3F0EB]">
                        <ChevronRight
                          size={16}
                          strokeWidth={1.5}
                          className="text-[#C77B42]"
                          style={{ opacity: 1 }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
            <div className="text-4xl">🍽</div>
            <p className="mt-3 font-inter text-sm font-semibold text-[#1A1A1A]">
              No items found
            </p>
            {searchTerm.trim() ? (
              <p className="mt-1 font-inter text-xs text-[#9CA3AF]">
                Try a different search term
              </p>
            ) : null}
          </div>
        )}
      </main>

      {showAllergyNotice ? (
        <div className="fixed inset-x-4 bottom-[86px] z-50 rounded-2xl border border-[#FFD4B8] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-inter text-sm font-semibold text-[#C2440E]">
                Allergy info
              </p>
              <p className="mt-1 font-inter text-xs leading-5 text-[#6B6B6B]">
                Please inform a member of staff of any allergies before ordering.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllergyNotice(false)}
              className="text-[#C2440E]"
              aria-label="Close allergy information"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ) : null}

      {previewItem ? (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.65)] p-6 transition-opacity duration-150 ${
            isPreviewVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closePreview}
        >
          <div
            className={`w-full max-w-[92vw] transition duration-150 ${
              isPreviewVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
              <div className="relative mx-auto min-h-[240px] w-full overflow-hidden rounded-t-[18px] bg-white/5">
                <button
                  type="button"
                  onClick={closePreview}
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(0,0,0,0.5)] text-white"
                  aria-label="Close image preview"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>

                {previewItem.image_url ? (
                  <Image
                    src={previewItem.image_url}
                    alt={previewItem.name ? `${previewItem.name} — Halfway Cafe Sidcup` : "Menu item at Halfway Cafe Sidcup"}
                    width={1200}
                    height={1200}
                    className="block h-auto max-h-[80vh] w-full object-contain"
                  />
                ) : (
                  <div className="flex min-h-[240px] items-center justify-center bg-white/10 text-5xl">
                    🍽
                  </div>
                )}
              </div>

              <div className="px-4 pb-4 pt-[12px] text-[#1A1A1A]">
                {(() => {
                  const sandwichExtraFormatPrices = getSandwichExtraFormatPrices(previewItem);

                  return (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-inter text-base font-semibold leading-snug text-[#1A1A1A]">
                          {previewItem.name ?? "Menu item"}
                        </p>
                        <p className="shrink-0 font-inter text-base font-bold text-[#D45E1A]">
                          {formatPrice(previewItem.price)}
                        </p>
                      </div>

                      {previewItem.description?.trim() ? (
                        <p className="mt-2 font-inter text-sm leading-6 text-[#6B6B6B]">
                          {previewItem.description.trim()}
                        </p>
                      ) : null}

                      {sandwichExtraFormatPrices.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                          {sandwichExtraFormatPrices.map((variant) => (
                            <span
                              key={variant.label}
                              className="inline-flex items-center gap-1 font-inter text-[12px] leading-5 text-[#7A6A5C]"
                            >
                              <span className="font-medium text-[#8A7969]">{variant.label}</span>
                              <span className="font-semibold text-[#D45E1A]">
                                {formatPrice(variant.value)}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <MobileBottomNav />
    </div>
  );
}
