"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Clock3,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import { createOptionalClientComponentClient } from "@/lib/supabase";

type CategoryRow = {
  id: string;
  name?: string | null;
  slug?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  active?: boolean | null;
};

type MenuItemCountRow = {
  category?: string | null;
};

type OpeningHoursRow = {
  id: string;
  day_name?: string | null;
  day_order?: number | null;
  open_time?: string | null;
  close_time?: string | null;
  is_closed?: boolean | null;
};

type MobileMenuData = {
  categories: CategoryRow[];
  openingHours: OpeningHoursRow[];
  itemCounts: Record<string, number>;
};

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "Closed";
  }

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return value;
  }

  return `${match[1]}:${match[2]}`;
}

function getDayIndex(row: OpeningHoursRow) {
  if (typeof row.day_order === "number") {
    return row.day_order === 7 ? 0 : row.day_order;
  }

  if (!row.day_name) {
    return -1;
  }

  return dayNames.findIndex((day) => day.toLowerCase() === row.day_name?.toLowerCase());
}

function CategorySkeletonList() {
  return (
    <div className="mx-4 flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[80px] animate-pulse rounded-2xl bg-gray-200"
        />
      ))}
    </div>
  );
}

export default function MobileMenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MobileMenuData>({
    categories: [],
    openingHours: [],
    itemCounts: {},
  });

  useEffect(() => {
    let isMounted = true;
    const supabase = createOptionalClientComponentClient("Mobile menu page");

    if (!supabase) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const client = supabase;

    async function loadMenuData() {
      setLoading(true);

      const { data: categoriesData } = await client
        .from("categories")
        .select("id, name, slug, image_url")
        .order("sort_order", { ascending: true });

      const [countsRes, hoursRes] = await Promise.all([
        client
          .from("menu_items")
          .select("category")
          .eq("active", true),
        client
          .from("opening_hours")
          .select("id, day_name, day_order, open_time, close_time, is_closed")
          .order("day_order", { ascending: true }),
      ]);

      if (!isMounted) {
        return;
      }

      const categories = (categoriesData ?? []) as CategoryRow[];
      const countRows = countsRes.error ? [] : ((countsRes.data ?? []) as MenuItemCountRow[]);
      const openingHours = hoursRes.error ? [] : ((hoursRes.data ?? []) as OpeningHoursRow[]);

      const itemCounts = countRows.reduce<Record<string, number>>((accumulator, row) => {
        const categorySlug = row.category?.trim();

        if (!categorySlug) {
          return accumulator;
        }

        accumulator[categorySlug] = (accumulator[categorySlug] ?? 0) + 1;
        return accumulator;
      }, {});

      setData({
        categories,
        openingHours,
        itemCounts,
      });
      setLoading(false);
    }

    loadMenuData().catch(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCategories = data.categories.filter((category) =>
    (category.name ?? "").toLowerCase().includes(normalizedSearch)
  );
  const todayIndex = new Date().getDay();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] md:hidden">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#E8E2D9] bg-[#FAF8F5] px-4">
        <Link href="/" className="flex w-9 items-center justify-start no-underline">
          <span className="font-inter text-xl leading-none text-gray-500">←</span>
        </Link>

        <div className="text-center">
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "22px",
              letterSpacing: "-0.2px",
              color: "#1A1A1A",
            }}
          >
            Our Menu
          </p>
          <p
            className="text-[#9CA3AF]"
            style={{ fontSize: "14px", fontWeight: 500, marginTop: "2px", opacity: 0.85 }}
          >
            Freshly made, every day
          </p>
        </div>

        <div className="w-9" />
      </header>

      <main className="overflow-x-hidden pb-[calc(58px+env(safe-area-inset-bottom,0px)+16px)]">
        <div className="mx-4 mb-4 mt-3 flex items-center gap-3 rounded-full border border-[#ECE8E2] bg-[#F7F5F2] px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search menu..."
            className="flex-1 bg-transparent font-inter text-sm text-[#1A1A1A] outline-none placeholder:text-gray-400"
          />
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
        </div>

        <section>
          <h2 className="mx-4 mb-2 font-inter text-base font-bold text-[#1A1A1A]">
            Categories
          </h2>

          {loading ? (
            <CategorySkeletonList />
          ) : filteredCategories.length > 0 ? (
            <div className="mx-4 flex flex-col gap-2.5">
              {filteredCategories.map((category) => {
                const itemCount = data.itemCounts[category.slug ?? ""] ?? 0;

                return (
                  <Link
                    key={category.id}
                    href={category.slug ? `/menu/${category.slug}` : "/menu"}
                    className="flex items-center overflow-hidden rounded-2xl bg-white px-[18px] py-[16px] no-underline"
                    style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)" }}
                  >
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#E8E2D9]">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name ?? "Menu category"}
                          fill
                          priority
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xl">🍽</span>
                      )}
                    </div>

                    <div className="ml-4 min-w-0 flex-1">
                      <p className="truncate font-inter text-sm font-semibold text-[#1A1A1A]">
                        {category.name ?? "Menu"}
                      </p>
                      <p className="mt-[2px] font-inter text-xs text-[#9CA3AF]">
                        {itemCount} items
                      </p>
                    </div>

                    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#F3F0EB] transition duration-150 ease-out hover:bg-[#EFEAE3] active:scale-[0.95] active:bg-[#EFEAE3]">
                      <ChevronRight
                        className="h-4 w-4"
                        strokeWidth={2.4}
                        style={{ color: "#C77B42" }}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mx-4 rounded-2xl bg-white px-4 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
              <p className="font-inter text-sm text-[#9CA3AF]">
                No matching categories found.
              </p>
            </div>
          )}
        </section>

        <section className="mx-4 mb-4 mt-6 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-[#FF6B35]" />
            <h2 className="font-inter text-base font-semibold text-[#FF6B35]">
              Opening Hours
            </h2>
          </div>

          <div className="mt-3 space-y-2">
            {loading ? (
              <>
                <div className="h-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 animate-pulse rounded bg-gray-200" />
              </>
            ) : (
              data.openingHours.map((row) => {
                const rowDayIndex = getDayIndex(row);
                const dayLabel =
                  row.day_name ?? (rowDayIndex >= 0 ? dayNames[rowDayIndex] : "Day");
                const hoursLabel = row.is_closed
                  ? "Closed"
                  : `${formatTime(row.open_time)} - ${formatTime(row.close_time)}`;

                return (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 py-[12px]"
                    style={{
                      background:
                        rowDayIndex === todayIndex ? "rgba(255,107,53,0.07)" : "transparent",
                      borderRadius: rowDayIndex === todayIndex ? "8px" : "0px",
                      paddingLeft: rowDayIndex === todayIndex ? "8px" : "0px",
                      paddingRight: rowDayIndex === todayIndex ? "8px" : "0px",
                    }}
                  >
                    <span
                      className="flex-1 font-inter text-sm"
                      style={{
                        color: rowDayIndex === todayIndex ? "#FF6B35" : "#6B6B6B",
                        fontWeight: rowDayIndex === todayIndex ? 600 : 400,
                      }}
                    >
                      {dayLabel}
                    </span>
                    <span
                      className="font-inter text-sm"
                      style={{
                        color: rowDayIndex === todayIndex ? "#FF6B35" : "#6B6B6B",
                        fontWeight: rowDayIndex === todayIndex ? 600 : 400,
                      }}
                    >
                      {hoursLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
}
