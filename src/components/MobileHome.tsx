"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Phone } from "lucide-react";
import { HALFWAY_CAFE_DIRECTIONS_URL, HALFWAY_CAFE_PLACE_URL } from "@/lib/maps";
import { HALFWAY_CAFE_PHONE_E164 } from "@/lib/contact";
import { createOptionalClientComponentClient } from "@/lib/supabase";
import { getMobileHeroImage, toSiteSettingsMap, type SiteSettingRow } from "@/lib/site-settings";
import MobileFooter from "@/components/MobileFooter";

type OpeningHoursRow = {
  id: string;
  day_name?: string | null;
  day_order?: number | null;
  open_time?: string | null;
  close_time?: string | null;
  is_closed?: boolean | null;
};

type CategoryRow = {
  id: string;
  name?: string | null;
  image_url?: string | null;
  slug?: string | null;
  sort_order?: number | null;
  active?: boolean | null;
};

type MenuItemRow = {
  id: string;
  name?: string | null;
  image_url?: string | null;
  category?: string | null;
  price?: number | string | null;
  sort_order?: number | null;
  created_at?: string | null;
  featured?: boolean | null;
  is_featured?: boolean | null;
  active?: boolean | null;
};

type HomeData = {
  heroImageUrl: string | null;
  openingHours: OpeningHoursRow[];
  dishes: MenuItemRow[];
  categories: CategoryRow[];
};

type TodayStatus = {
  isOpen: boolean;
  label: string;
  detail: string;
};

type GoogleReview = {
  text: string;
  author: string;
};

type GoogleReviewsData = {
  rating: number | null;
  reviewCount: number | null;
  reviews: GoogleReview[];
};

type PlatformCard = {
  name: string;
  url: string;
  logo: string;
};

type SocialLink = {
  name: string;
  url: string;
};

const defaultHeroBackground = "#2C1A0E";
const todayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: "🏠",
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/menu",
    label: "Menu",
    icon: "🍽",
    isActive: (pathname: string) => pathname === "/menu" || pathname.startsWith("/menu/"),
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: "🖼",
    isActive: (pathname: string) => pathname === "/gallery" || pathname.startsWith("/gallery/"),
  },
  {
    href: "/contact",
    label: "Visit Us",
    icon: "📍",
    isActive: (pathname: string) => pathname === "/contact" || pathname.startsWith("/contact/"),
  },
];

function formatCategoryLabel(value: string | null | undefined) {
  if (!value) {
    return "Menu";
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTimeLabel(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return value;
  }

  return `${Number(match[1])}:${match[2]}`;
}

function formatPrice(value: number | string | null | undefined) {
  const numericValue =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (Number.isNaN(numericValue)) {
    return "";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(numericValue);
}

function getTodayStatus(rows: OpeningHoursRow[]): TodayStatus {
  const currentDay = new Date().getDay();
  const todayName = todayNames[currentDay];

  const matchingRow =
    rows.find((row) => row.day_name?.toLowerCase() === todayName.toLowerCase()) ??
    rows.find((row) => {
      if (typeof row.day_order !== "number") {
        return false;
      }

      return row.day_order === currentDay || (row.day_order === 7 ? 0 : row.day_order) === currentDay;
    }) ??
    null;

  if (!matchingRow) {
    return {
      isOpen: false,
      label: "Hours Unavailable",
      detail: "Please contact the cafe for today's hours.",
    };
  }

  if (matchingRow.is_closed) {
    return {
      isOpen: false,
      label: "Closed Today",
      detail: "Please check tomorrow's opening hours.",
    };
  }

  const openTime = formatTimeLabel(matchingRow.open_time);
  const closeTime = formatTimeLabel(matchingRow.close_time);

  return {
    isOpen: true,
    label: "Open Today",
    detail: openTime && closeTime ? `${openTime} – ${closeTime}` : "Hours available in store.",
  };
}

function HeroSkeleton() {
  return <div className="mx-4 mt-3 h-[220px] animate-pulse rounded-[20px] bg-gray-200" />;
}

function DishesSkeleton() {
  return (
    <div className="mt-3 flex gap-3 px-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="w-40 shrink-0 overflow-hidden rounded-2xl bg-[#F9F6F2]">
          <div className="h-[100px] animate-pulse bg-gray-200" />
          <div className="space-y-2 p-3">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatReviewCount(value: number | null) {
  if (!value || value < 1) {
    return null;
  }

  return value.toLocaleString("en-GB");
}

function getSiteUrl(settings: Record<string, string>, key: string) {
  const value = settings[key]?.trim();

  if (!value) {
    return null;
  }

  return /^https?:\/\//i.test(value) ? value : null;
}

function getSortOrderValue(item: MenuItemRow) {
  return typeof item.sort_order === "number" ? item.sort_order : Number.MAX_SAFE_INTEGER;
}

function getCreatedAtValue(item: MenuItemRow) {
  if (!item.created_at) {
    return 0;
  }

  const timestamp = new Date(item.created_at).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function comparePopularDishPriority(a: MenuItemRow, b: MenuItemRow) {
  const sortOrderDifference = getSortOrderValue(a) - getSortOrderValue(b);

  if (sortOrderDifference !== 0) {
    return sortOrderDifference;
  }

  const createdAtDifference = getCreatedAtValue(b) - getCreatedAtValue(a);

  if (createdAtDifference !== 0) {
    return createdAtDifference;
  }

  return (a.name ?? "").localeCompare(b.name ?? "");
}

function getPopularDishes(items: MenuItemRow[]) {
  const featuredItems = items.filter((item) => item.featured === true || item.is_featured === true);

  if (featuredItems.length > 0) {
    return [...featuredItems].sort(comparePopularDishPriority);
  }

  return [...items]
    .sort((a, b) => getCreatedAtValue(b) - getCreatedAtValue(a))
    .slice(0, 4);
}

export default function MobileHome() {
  const pathname = usePathname();
  const [data, setData] = useState<HomeData>({
    heroImageUrl: null,
    openingHours: [],
    dishes: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [googleReviews, setGoogleReviews] = useState<GoogleReviewsData>({
    rating: null,
    reviewCount: null,
    reviews: [],
  });
  const [deliveryPlatforms, setDeliveryPlatforms] = useState<PlatformCard[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    let isMounted = true;
    const supabase = createOptionalClientComponentClient("Mobile home");

    if (!supabase) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const client = supabase;

    async function loadHomeData() {
      setLoading(true);

      const [settingsRes, hoursRes, categoriesRes, menuItemsRes, googleReviewsRes] = await Promise.all([
        client
          .from("site_settings")
          .select("key, value")
          .in("key", [
            "hero_image_web",
            "hero_image_mobile",
            "delivery_ubereats",
            "delivery_ubereats_logo",
            "delivery_justeat",
            "delivery_justeat_logo",
            "delivery_deliveroo",
            "delivery_deliveroo_logo",
            "social_instagram",
            "social_facebook",
            "social_tiktok",
          ]),
        client.from("opening_hours").select("*").order("day_order", { ascending: true }),
        client
          .from("categories")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true }),
        client
          .from("menu_items")
          .select("*")
          .eq("active", true)
          .order("created_at", { ascending: false }),
        fetch("/api/google-reviews", { cache: "no-store" }).catch(() => null),
      ]);

      if (!isMounted) {
        return;
      }

      const openingHours = hoursRes.error ? [] : ((hoursRes.data ?? []) as OpeningHoursRow[]);
      const categories = categoriesRes.error ? [] : ((categoriesRes.data ?? []) as CategoryRow[]);
      const menuItems = menuItemsRes.error ? [] : ((menuItemsRes.data ?? []) as MenuItemRow[]);
      const siteSettings = settingsRes.error
        ? {}
        : toSiteSettingsMap((settingsRes.data ?? []) as SiteSettingRow[]);

      const dishes = getPopularDishes(menuItems);
      const nextDeliveryPlatforms: PlatformCard[] = [
        {
          name: "Uber Eats",
          logo: getSiteUrl(siteSettings, "delivery_ubereats_logo") ?? "",
          url: getSiteUrl(siteSettings, "delivery_ubereats") ?? "",
        },
        {
          name: "Just Eat",
          logo: getSiteUrl(siteSettings, "delivery_justeat_logo") ?? "",
          url: getSiteUrl(siteSettings, "delivery_justeat") ?? "",
        },
        {
          name: "Deliveroo",
          logo: getSiteUrl(siteSettings, "delivery_deliveroo_logo") ?? "",
          url: getSiteUrl(siteSettings, "delivery_deliveroo") ?? "",
        },
      ].filter((platform) => platform.url.length > 0 && platform.logo.length > 0);
      const nextSocialLinks: SocialLink[] = [
        { name: "Instagram", url: getSiteUrl(siteSettings, "social_instagram") ?? "" },
        { name: "Facebook", url: getSiteUrl(siteSettings, "social_facebook") ?? "" },
        { name: "TikTok", url: getSiteUrl(siteSettings, "social_tiktok") ?? "" },
      ].filter((social) => social.url.length > 0);
      let normalizedGoogleReviews: GoogleReviewsData = {
        rating: null,
        reviewCount: null,
        reviews: [],
      };

      if (googleReviewsRes?.ok) {
        const payload = (await googleReviewsRes.json()) as Partial<GoogleReviewsData>;

        normalizedGoogleReviews = {
          rating: typeof payload.rating === "number" ? payload.rating : null,
          reviewCount: typeof payload.reviewCount === "number" ? payload.reviewCount : null,
          reviews: Array.isArray(payload.reviews)
            ? payload.reviews
                .filter(
                  (review): review is GoogleReview =>
                    typeof review?.text === "string" && typeof review?.author === "string"
                )
                .slice(0, 3)
            : [],
        };
      }

      setData({
        heroImageUrl: getMobileHeroImage(siteSettings),
        openingHours,
        dishes,
        categories,
      });
      setGoogleReviews(normalizedGoogleReviews);
      setDeliveryPlatforms(nextDeliveryPlatforms);
      setSocialLinks(nextSocialLinks);
      setLoading(false);
    }

    loadHomeData().catch(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const todayStatus = getTodayStatus(data.openingHours);
  const trustRating = googleReviews.rating ?? 4.9;
  const trustReviewCount = formatReviewCount(googleReviews.reviewCount);

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] md:hidden">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-white px-4 shadow-[0_1px_10px_rgba(0,0,0,0.06)]">
        <Link href="/" className="flex items-center no-underline">
          <span className="mr-1">
            <Image
              src="https://jbatmtnlegydsjerkuml.supabase.co/storage/v1/object/public/Hero/icon-logo.png"
              alt="Halfway Cafe logo"
              width={36}
              height={36}
              className="rounded-full"
            />
          </span>
          <span className="font-playfair text-xl font-bold text-[#FF6B35]">
            Halfway Cafe
          </span>
        </Link>
        <a
          href={`tel:${HALFWAY_CAFE_PHONE_E164}`}
          aria-label="Call Halfway Cafe"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E8E8] text-[#1A1A1A] no-underline shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        >
          <Phone className="h-4 w-4" />
        </a>
      </header>

      <main className="overflow-x-hidden pb-[calc(64px+env(safe-area-inset-bottom,0px)+20px)]">
        {loading ? (
          <>
            <HeroSkeleton />

            <div className="mx-4 mt-3 animate-pulse rounded-xl border border-[#E8E8E8] bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-28 rounded bg-gray-200" />
                </div>
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>

            <section className="mt-5">
              <h2 className="mx-4 mb-3 font-inter text-base font-bold text-[#1A1A1A]">
                Popular Dishes
              </h2>
              <DishesSkeleton />
            </section>

            <section className="mt-5">
              <h2 className="mx-4 mb-3 font-inter text-base font-bold text-[#1A1A1A]">
                Our Menu
              </h2>
              <div className="mx-4 grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="overflow-hidden rounded-2xl bg-[#F9F6F2]">
                    <div className="h-[90px] animate-pulse bg-gray-200" />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section
              className="mx-4 mt-3 overflow-hidden rounded-[20px]"
              style={{
                backgroundColor: defaultHeroBackground,
                backgroundImage: data.heroImageUrl ? `url(${data.heroImageUrl})` : undefined,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <div
                className="flex min-h-[220px] items-end px-4 pb-5 pt-6"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 100%)",
                }}
              >
                <div className="max-w-[240px]">
                  <h1 className="font-playfair text-[28px] font-bold leading-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.22)]">
                    Halfway Cafe
                  </h1>
                  <p
                    className="mt-2 max-w-[220px] font-inter text-sm leading-5 text-white"
                    style={{ opacity: 0.94, textShadow: "0 2px 8px rgba(0, 0, 0, 0.18)" }}
                  >
                    Proper Full English Breakfast
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/menu"
                      className="rounded-full bg-[#FF6B35] px-5 py-2 font-inter text-sm font-medium text-white no-underline"
                    >
                      View Menu
                    </Link>
                    <a
                      href={HALFWAY_CAFE_DIRECTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white px-5 py-2 font-inter text-sm font-medium text-white no-underline"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-4 mt-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-[#E8E0D8] bg-[#F9F6F2] px-3 py-3">
                  <p className="mt-1 font-inter text-sm font-semibold text-[#1A1A1A]">
                    ⭐ {trustRating.toFixed(1)} Google Rating
                  </p>
                  <p className="mt-1 font-inter text-[12px] font-normal leading-4 text-[#6B6B6B]">
                    {trustReviewCount
                      ? `Based on ${trustReviewCount} reviews`
                      : "Based on local customer reviews"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E8E0D8] bg-[#F9F6F2] px-3 py-3">
                  <p className="font-inter text-sm font-semibold text-[#1A1A1A]">
                    ☕ Serving Sidcup for 20+ years
                  </p>
                  <p className="mt-1 font-inter text-[12px] font-normal leading-4 text-[#6B6B6B]">
                    Local breakfast & coffee
                  </p>
                </div>
              </div>
            </section>

            {googleReviews.reviews.length > 0 ? (
              <section className="mt-5">
                <div className="mx-4 mb-3">
                  <h2 className="font-inter text-base font-bold text-[#1A1A1A]">
                    Customer Reviews
                  </h2>
                </div>

                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {googleReviews.reviews.map((review) => (
                    <article
                      key={`${review.author}-${review.text}`}
                      className="flex h-[156px] w-[250px] shrink-0 snap-start flex-col rounded-2xl border border-[#E8E0D8] bg-[#F9F6F2] px-4 py-3"
                    >
                      <p className="mb-[6px] font-inter text-[14px] leading-none tracking-[0.12em] text-[#F5B301]">
                        ★★★★★
                      </p>
                      <p
                        className="font-inter text-sm leading-5 text-[#1A1A1A]"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 3,
                          overflow: "hidden",
                        }}
                      >
                        &ldquo;{review.text}&rdquo;
                      </p>
                      <p className="mt-3 text-xs font-medium text-[#6B6B6B]">
                        {review.author}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="px-4 pt-3">
                  <a
                    href={HALFWAY_CAFE_PLACE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-inter text-[11px] font-medium text-[#8A7C6D] no-underline"
                  >
                    See all reviews on Google
                  </a>
                </div>
              </section>
            ) : null}

            <section className="mx-4 mt-3 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: todayStatus.isOpen ? "#22C55E" : "#EF4444" }}
                    />
                    <span className="font-inter text-sm font-bold text-[#1A1A1A]">
                      {todayStatus.label}
                    </span>
                  </div>
                  <p className="mt-1 font-inter text-sm text-[#6B6B6B]">
                    {todayStatus.detail}
                  </p>
                </div>
                <div className="pt-0.5 text-right">
                  <p className="font-inter text-xs text-[#6B6B6B]">📍 176 Halfway St, Sidcup</p>
                </div>
              </div>
            </section>

            <section className="mt-5">
              <div className="mx-4 mb-3 flex items-center justify-between gap-4">
                <h2 className="font-inter text-[17px] font-bold tracking-[-0.01em] text-[#1A1A1A]">
                  Popular Dishes
                </h2>
                <Link
                  href="/menu"
                  className="shrink-0 font-inter text-[13px] font-medium text-[#8A6A56] no-underline"
                >
                  View Menu →
                </Link>
              </div>

              {data.dishes.length > 0 ? (
                <>
                  <div
                    className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {data.dishes.map((item) => {
                      const matchingCategory = data.categories.find(
                        (category) => category.slug === item.category
                      );
                      const badgeLabel = "Popular";

                      return (
                        <Link
                          key={item.id}
                          href="/menu"
                          className="w-[168px] shrink-0 snap-start overflow-hidden rounded-[18px] border border-[#EEE5DD] bg-[#F9F6F2] no-underline"
                        >
                          <div className="relative h-[110px] w-full bg-gray-200">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name ? `${item.name} — Halfway Cafe Sidcup` : "Popular dish at Halfway Cafe Sidcup"}
                                fill
                                sizes="168px"
                                className="object-cover object-center"
                              />
                            ) : null}
                            <span
                              className="absolute rounded-full font-inter text-[12px] font-semibold leading-none tracking-[0.02em] text-[#7A5B48]"
                              style={{
                                top: "10px",
                                left: "10px",
                                backgroundColor: "rgba(255,255,255,0.85)",
                                backdropFilter: "blur(4px)",
                                padding: "4px 8px",
                              }}
                            >
                              {badgeLabel}
                            </span>
                          </div>
                          <div className="space-y-2 px-3 py-3">
                            <p className="truncate font-inter text-[14px] font-semibold leading-5 text-[#1A1A1A]">
                              {item.name ?? "Menu item"}
                            </p>
                            <p className="font-inter text-[12px] leading-4 text-[#6B6B6B]">
                              {matchingCategory?.name ?? formatCategoryLabel(item.category)}
                            </p>
                            <p className="font-inter text-[15px] font-extrabold leading-5 text-[#FF6B35]">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="mx-4 rounded-2xl bg-[#F9F6F2] px-4 py-6 text-center">
                  <p className="font-inter text-sm text-[#6B6B6B]">
                    Popular dishes will appear here once menu items are available.
                  </p>
                </div>
              )}
            </section>

            <section className="mt-5">
              <h2 className="mx-4 mb-3 font-inter text-base font-bold text-[#1A1A1A]">
                Our Menu
              </h2>

              {data.categories.length > 0 ? (
                <div className="mx-4 grid grid-cols-2 gap-3">
                  {data.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={category.slug ? `/menu/${category.slug}` : "/menu"}
                      className="relative cursor-pointer overflow-hidden rounded-2xl no-underline"
                    >
                      <div className="relative h-[90px] w-full bg-gray-200">
                        {category.image_url ? (
                          <Image
                            src={category.image_url}
                            alt={category.name ? `${category.name} menu — Halfway Cafe Sidcup` : "Menu category at Halfway Cafe Sidcup"}
                            width={400}
                            height={180}
                            sizes="(max-width: 767px) 50vw, 180px"
                            className="h-[90px] w-full object-cover"
                          />
                        ) : null}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.05))",
                          }}
                        />
                        <span className="absolute bottom-2 left-3 font-inter text-sm font-semibold tracking-[0.01em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.18)]">
                          {category.name ?? "Menu"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mx-4 rounded-2xl bg-[#F9F6F2] px-4 py-6 text-center">
                  <p className="font-inter text-sm text-[#6B6B6B]">
                    Menu categories will appear here once they are available.
                  </p>
                </div>
              )}
            </section>

            {deliveryPlatforms.length > 0 ? (
              <section className="mt-6">
                <div className="mx-4 mb-3">
                  <h2 className="font-inter text-base font-bold text-[#1A1A1A]">
                    Order Online
                  </h2>
                  <p className="mt-0.5 font-inter text-xs text-[#6B6B6B]">
                    Available on delivery apps
                  </p>
                </div>

                <div className="mx-4 flex items-center justify-between gap-4">
                  {deliveryPlatforms.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center rounded-xl border border-[#ECE7E1] bg-[#F8F6F3] px-4 py-2.5 no-underline transition-colors duration-150 hover:bg-[#F2EEE8] active:bg-[#EDE8E2]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={platform.logo}
                        alt={platform.name}
                        className="w-auto object-contain"
                        style={{
                          maxHeight: "26px",
                          maxWidth: "100px",
                        }}
                      />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {socialLinks.length > 0 ? (
              <section className="mt-[24px]">
                <div className="mx-4 text-center">
                  <h2 className="font-inter text-base font-bold text-[#1A1A1A]">
                    Follow Us
                  </h2>
                  <p className="mt-1 font-inter text-xs text-[#6B6B6B]">
                    Daily specials & cafe updates
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ECE7E1] bg-[#F8F6F3] text-[#7A5B48] no-underline transition duration-150 hover:bg-[#F2EEE8] active:scale-95 active:bg-[#F2EEE8]"
                      >
                        {social.name === "Instagram" ? (
                          <Instagram className="h-[18px] w-[18px]" />
                        ) : social.name === "Facebook" ? (
                          <Facebook className="h-[18px] w-[18px]" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.12v12.41a2.6 2.6 0 11-2.25-2.57V8.67a5.72 5.72 0 00-.72-.04A5.74 5.74 0 1015.47 14V9.73a8.01 8.01 0 004.53 1.4V8.02c-.14.01-.28.02-.41.02z" />
                          </svg>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )}
      <MobileFooter />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E8E8E8] bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid h-16 grid-cols-4">
          {navItems.map((item) => {
            const isActive = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 no-underline"
              >
                <span
                  className="text-base"
                  style={{ color: isActive ? "#FF6B35" : "#9CA3AF" }}
                >
                  {item.icon}
                </span>
                <span
                  className="font-inter text-[11px] font-medium"
                  style={{ color: isActive ? "#FF6B35" : "#9CA3AF" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
