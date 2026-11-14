"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Coffee,
  Facebook,
  Home as HomeIcon,
  Images,
  Instagram,
  MapPin,
  Phone,
  Star,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HALFWAY_CAFE_DIRECTIONS_URL, HALFWAY_CAFE_PLACE_URL } from "@/lib/maps";
import { HALFWAY_CAFE_PHONE_E164 } from "@/lib/contact";
import { useLondonWeekdayIndex } from "@/lib/use-london-today";
import HomeMarquee from "@/components/sections/HomeMarquee";
import MobileFooter from "@/components/MobileFooter";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ResponsivePublicImage from "@/components/ui/ResponsivePublicImage";
import type { ResolvedPublicImage } from "@/types/public-image";

export type OpeningHoursRow = {
  id: string;
  day_name?: string | null;
  day_order?: number | null;
  open_time?: string | null;
  close_time?: string | null;
  is_closed?: boolean | null;
};

export type CategoryRow = {
  id: string;
  name?: string | null;
  image_url?: string | null;
  slug?: string | null;
  sort_order?: number | null;
  active?: boolean | null;
  image?: ResolvedPublicImage | null;
};

export type MenuItemRow = {
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
  image?: ResolvedPublicImage | null;
};

export type HomeData = {
  heroImage: ResolvedPublicImage | null;
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

export type PlatformCard = {
  name: string;
  url: string;
  logo: ResolvedPublicImage;
};

export type SocialLink = {
  name: string;
  url: string;
};

const defaultHeroBackground = "#130f0b";
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
    icon: HomeIcon,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/menu",
    label: "Menu",
    icon: Utensils,
    isActive: (pathname: string) => pathname === "/menu" || pathname.startsWith("/menu/"),
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: Images,
    isActive: (pathname: string) => pathname === "/gallery" || pathname.startsWith("/gallery/"),
  },
  {
    href: "/contact",
    label: "Visit Us",
    icon: MapPin,
    isActive: (pathname: string) => pathname === "/contact" || pathname.startsWith("/contact/"),
  },
] satisfies {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}[];

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

function getTodayStatus(rows: OpeningHoursRow[], currentDay: number): TodayStatus {
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
  return (
    <div className="border-b border-rule bg-bg px-4 pb-5 pt-5">
      <div className="h-[44px] w-32 animate-pulse rounded bg-bg-soft" />
      <div className="mt-5 h-[96px] animate-pulse rounded bg-bg-soft" />
      <div className="mt-5 h-[250px] animate-pulse bg-bg-dark/15" />
    </div>
  );
}

function DishesSkeleton() {
  return (
    <div className="mt-3 flex gap-3 px-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="w-40 shrink-0 overflow-hidden border border-rule bg-bg-soft">
          <div className="h-[100px] animate-pulse bg-bg-dark/15" />
          <div className="space-y-2 p-3">
            <div className="h-4 animate-pulse rounded bg-bg-dark/15" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-bg-dark/15" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-bg-dark/15" />
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

export default function MobileHome({
  data,
  deliveryPlatforms,
  socialLinks,
  logoImage,
  initialWeekdayIndex,
}: {
  data: HomeData;
  deliveryPlatforms: PlatformCard[];
  socialLinks: SocialLink[];
  logoImage: ResolvedPublicImage;
  initialWeekdayIndex: number;
}) {
  const pathname = usePathname();
  const loading = false;
  const [googleReviews, setGoogleReviews] = useState<GoogleReviewsData>({
    rating: null,
    reviewCount: null,
    reviews: [],
  });
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      const response = await fetch("/api/google-reviews", { cache: "no-store" }).catch(() => null);
      if (!isMounted || !response?.ok) return;
      const payload = (await response.json()) as Partial<GoogleReviewsData>;
      setGoogleReviews({
        rating: typeof payload.rating === "number" ? payload.rating : null,
        reviewCount: typeof payload.reviewCount === "number" ? payload.reviewCount : null,
        reviews: Array.isArray(payload.reviews)
          ? payload.reviews.filter(
              (review): review is GoogleReview =>
                typeof review?.text === "string" && typeof review?.author === "string",
            ).slice(0, 3)
          : [],
      });
    }
    void loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const londonWeekdayIndex = useLondonWeekdayIndex();
  const todayStatus = getTodayStatus(
    data.openingHours,
    londonWeekdayIndex ?? initialWeekdayIndex,
  );
  const trustRating = googleReviews.rating ?? 4.9;
  const trustReviewCount = formatReviewCount(googleReviews.reviewCount);

  return (
    <div className="min-h-screen bg-bg text-text md:hidden">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-rule bg-bg/95 px-4 backdrop-blur">
        <Link href="/" className="flex items-center no-underline">
          <span className="mr-1">
            <ResponsivePublicImage
              image={logoImage}
              alt="Halfway Cafe logo"
              width={36}
              height={36}
              className="rounded-full"
            />
          </span>
          <span className="font-playfair text-xl font-black text-text">
            Halfway Cafe
          </span>
        </Link>
        <a
          href={`tel:${HALFWAY_CAFE_PHONE_E164}`}
          aria-label="Call Halfway Cafe"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-rule-strong bg-bg-soft text-text no-underline shadow-[0_4px_12px_rgba(27,23,19,0.05)] transition active:scale-95 motion-reduce:transition-none"
        >
          <Phone className="h-4 w-4" />
        </a>
      </header>

      <main className="overflow-x-hidden pb-[calc(64px+env(safe-area-inset-bottom,0px)+20px)]">
        {loading ? (
          <>
            <HeroSkeleton />

            <div className="mx-4 mt-4 animate-pulse border border-rule bg-bg-soft px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-bg-dark/15" />
                  <div className="h-3 w-28 rounded bg-bg-dark/15" />
                </div>
                <div className="h-3 w-24 rounded bg-bg-dark/15" />
              </div>
            </div>

            <section className="mt-5">
              <h2 className="mx-4 mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.22em] text-text-light">
                Popular Dishes
              </h2>
              <DishesSkeleton />
            </section>

            <section className="mt-5">
              <h2 className="mx-4 mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.22em] text-text-light">
                Our Menu
              </h2>
              <div className="mx-4 grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="overflow-hidden border border-rule bg-bg-soft">
                    <div className="h-[90px] animate-pulse bg-bg-dark/15" />
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="relative overflow-hidden border-b border-rule bg-bg px-4 pb-5 pt-5">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(216,95,47,0.05)_0_1px,transparent_1px_100%),linear-gradient(180deg,rgba(27,23,19,0.04)_0_1px,transparent_1px_100%)] bg-[size:46px_46px]" />

              <ScrollReveal duration={650} className="relative z-10">
                <p className="font-mono text-[11px] font-medium uppercase leading-none tracking-[0.24em] text-accent">
                  Family-run British caff · Sidcup DA15
                </p>
                <div className="mt-4 h-px w-16 bg-rule-strong" />

                <h1
                  className="mt-4 max-w-[9ch] font-playfair text-[48px] font-black leading-[0.88] text-text"
                  style={{ fontVariationSettings: '"wght" 900' }}
                >
                  Best Breakfast in Sidcup
                </h1>

                <p className="mt-4 font-playfair text-[23px] italic leading-tight text-accent-dark">
                  Full English, sandwiches &amp; proper coffee
                </p>

                <p className="mt-3 font-inter text-sm font-semibold leading-6 text-text-mid">
                  Big portions · Quick service · No booking needed
                </p>

                <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-text-light">
                  176 Halfway Street, Sidcup DA15
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link
                    href="/menu"
                    className="btn-editorial btn-editorial-accent flex min-h-11 items-center justify-center rounded-full border border-accent bg-accent px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-white no-underline hover:border-accent-dark hover:bg-accent-dark hover:text-white active:text-white"
                  >
                    View Menu
                  </Link>
                  <a
                    href={HALFWAY_CAFE_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-editorial btn-editorial-secondary flex min-h-11 items-center justify-center rounded-full border border-rule-strong bg-bg-soft px-4 py-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-text no-underline hover:border-accent hover:bg-white hover:text-accent-dark"
                  >
                    Get Directions
                  </a>
                </div>

                <a
                  href={`tel:${HALFWAY_CAFE_PHONE_E164}`}
                  className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-full border border-rule bg-bg/80 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-text-mid no-underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Halfway Cafe
                </a>
              </ScrollReveal>

              <ScrollReveal duration={750} delay={90} className="relative z-10 mt-5">
                <div
                  className="relative h-[245px] overflow-hidden border border-rule-strong bg-bg-dark"
                  style={{ backgroundColor: defaultHeroBackground }}
                >
                  {data.heroImage ? (
                    <ResponsivePublicImage
                      image={data.heroImage}
                      alt="Inside Halfway Cafe in Sidcup during a busy breakfast service"
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,15,11,0.02),rgba(19,15,11,0.52))]" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 border-t border-rule-light pt-3 text-white/90">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em]">
                      Breakfast served daily
                    </p>
                    <p className="font-playfair text-2xl italic text-yellow">Since 2003</p>
                  </div>
                </div>
              </ScrollReveal>
            </section>

            <div className="[&_p]:py-2 [&_p]:text-[10px] [&_p]:tracking-[0.2em]">
              <HomeMarquee />
            </div>

            <ScrollReveal as="section" duration={650} className="mx-4 mt-5">
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-rule bg-bg-soft px-3 py-3 shadow-[0_12px_30px_rgba(27,23,19,0.04)]">
                  <Star className="h-4 w-4 fill-yellow text-yellow" />
                  <p className="mt-2 font-inter text-sm font-semibold text-text">
                    {trustRating.toFixed(1)} Google Rating
                  </p>
                  <p className="mt-1 font-inter text-[12px] font-normal leading-4 text-text-mid">
                    {trustReviewCount
                      ? `Based on ${trustReviewCount} reviews`
                      : "Based on local customer reviews"}
                  </p>
                </div>
                <div className="border border-rule bg-bg-soft px-3 py-3 shadow-[0_12px_30px_rgba(27,23,19,0.04)]">
                  <Coffee className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-inter text-sm font-semibold text-text">
                    Serving Sidcup for 20+ years
                  </p>
                  <p className="mt-1 font-inter text-[12px] font-normal leading-4 text-text-mid">
                    Local breakfast & coffee
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {googleReviews.reviews.length > 0 ? (
              <ScrollReveal as="section" duration={650} className="mt-7">
                <div className="mx-4 mb-3">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-text-light">
                    Word from the counter
                  </p>
                  <h2 className="mt-1 font-playfair text-[26px] font-black leading-tight text-text">
                    Customer Reviews
                  </h2>
                </div>

                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {googleReviews.reviews.map((review) => (
                    <article
                      key={`${review.author}-${review.text}`}
                      className="flex h-[162px] w-[260px] shrink-0 snap-start flex-col border border-rule bg-bg-soft px-4 py-3"
                    >
                      <p className="mb-[6px] font-inter text-[14px] leading-none tracking-[0.12em] text-yellow">
                        ★★★★★
                      </p>
                      <p
                        className="font-inter text-sm leading-5 text-text"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 3,
                          overflow: "hidden",
                        }}
                      >
                        &ldquo;{review.text}&rdquo;
                      </p>
                      <p className="mt-3 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-text-light">
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
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent-dark no-underline"
                  >
                    See all reviews on Google
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </ScrollReveal>
            ) : null}

            <ScrollReveal as="section" duration={650} className="mx-4 mt-5 border border-rule bg-bg-soft px-4 py-4 shadow-[0_16px_36px_rgba(27,23,19,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: todayStatus.isOpen ? "#22C55E" : "#EF4444" }}
                    />
                    <span className="font-inter text-sm font-bold text-text">
                      {todayStatus.label}
                    </span>
                  </div>
                  <p className="mt-1 font-inter text-sm text-text-mid">
                    {todayStatus.detail}
                  </p>
                </div>
                <div className="flex max-w-[132px] items-start justify-end gap-1 pt-0.5 text-right">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  <p className="font-inter text-xs leading-4 text-text-mid">176 Halfway St, Sidcup</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal as="section" duration={650} className="mt-7">
              <div className="mx-4 mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-text-light">
                    From the grill
                  </p>
                  <h2 className="mt-1 font-playfair text-[28px] font-black leading-tight text-text">
                    Popular Dishes
                  </h2>
                </div>
                <Link
                  href="/menu"
                  className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent-dark no-underline"
                >
                  View Menu
                  <ArrowRight className="h-3 w-3" />
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
                          className="w-[172px] shrink-0 snap-start overflow-hidden border border-rule bg-bg-soft no-underline shadow-[0_12px_28px_rgba(27,23,19,0.04)]"
                        >
                          <div className="relative h-[112px] w-full bg-bg-dark/15">
                            {item.image ? (
                              <ResponsivePublicImage
                                image={item.image}
                                alt={
                                  item.name
                                    ? `${item.name} from the menu at Halfway Cafe in Sidcup`
                                    : "Full English breakfast plate with eggs and bacon"
                                }
                                fill
                                sizes="168px"
                                className="object-cover object-center"
                              />
                            ) : null}
                            <span
                              className="absolute rounded-full font-mono text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-text"
                              style={{
                                top: "10px",
                                left: "10px",
                                backgroundColor: "rgba(247,242,232,0.9)",
                                backdropFilter: "blur(4px)",
                                padding: "5px 8px",
                              }}
                            >
                              {badgeLabel}
                            </span>
                          </div>
                          <div className="space-y-2 px-3 py-3">
                            <p className="truncate font-inter text-[14px] font-semibold leading-5 text-text">
                              {item.name ?? "Menu item"}
                            </p>
                            <p className="font-inter text-[12px] leading-4 text-text-mid">
                              {matchingCategory?.name ?? formatCategoryLabel(item.category)}
                            </p>
                            <p className="font-inter text-[15px] font-extrabold leading-5 text-accent">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="mx-4 border border-rule bg-bg-soft px-4 py-6 text-center">
                  <p className="font-inter text-sm text-text-mid">
                    Popular dishes will appear here once menu items are available.
                  </p>
                </div>
              )}
            </ScrollReveal>

            <ScrollReveal as="section" duration={650} className="mt-8">
              <div className="mx-4 mb-3">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-text-light">
                  Browse the menu
                </p>
                <h2 className="mt-1 font-playfair text-[28px] font-black leading-tight text-text">
                  Our Menu
                </h2>
              </div>

              {data.categories.length > 0 ? (
                <div className="mx-4 grid grid-cols-2 gap-3">
                  {data.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={category.slug ? `/menu/${category.slug}` : "/menu"}
                      className="relative cursor-pointer overflow-hidden border border-rule bg-bg-dark no-underline shadow-[0_12px_28px_rgba(27,23,19,0.05)]"
                    >
                      <div className="relative h-[102px] w-full bg-bg-dark/40">
                        {category.image ? (
                          <ResponsivePublicImage
                            image={category.image}
                            alt={
                              category.name
                                ? `${category.name} menu options at Halfway Cafe in Sidcup`
                                : "Breakfast menu options at Halfway Cafe in Sidcup"
                            }
                            width={400}
                            height={180}
                            sizes="(max-width: 767px) 50vw, 180px"
                            className="h-[102px] w-full object-cover"
                          />
                        ) : null}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.05))",
                          }}
                        />
                        <span className="absolute bottom-3 left-3 right-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.18)]">
                          {category.name ?? "Menu"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mx-4 border border-rule bg-bg-soft px-4 py-6 text-center">
                  <p className="font-inter text-sm text-text-mid">
                    Menu categories will appear here once they are available.
                  </p>
                </div>
              )}
            </ScrollReveal>

            {deliveryPlatforms.length > 0 ? (
              <ScrollReveal as="section" duration={650} className="mt-8">
                <div className="mx-4 mb-3">
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-text-light">
                    Takeaway
                  </p>
                  <h2 className="mt-1 font-playfair text-[26px] font-black leading-tight text-text">
                    Order Online
                  </h2>
                  <p className="mt-1 font-inter text-xs text-text-mid">
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
                      className="flex flex-1 items-center justify-center border border-rule bg-bg-soft px-4 py-2.5 no-underline transition-colors duration-150 hover:bg-white active:bg-bg motion-reduce:transition-none"
                    >
                      <ResponsivePublicImage
                        image={platform.logo}
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
              </ScrollReveal>
            ) : null}

            {socialLinks.length > 0 ? (
              <ScrollReveal as="section" duration={650} className="mt-8">
                <div className="mx-4 text-center">
                  <h2 className="font-playfair text-[26px] font-black leading-tight text-text">
                    Follow Us
                  </h2>
                  <p className="mt-1 font-inter text-xs text-text-mid">
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
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-bg-soft text-accent-dark no-underline transition duration-150 hover:bg-white active:scale-95 active:bg-bg motion-reduce:transition-none"
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
              </ScrollReveal>
            ) : null}
          </>
        )}
      <MobileFooter />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-bg/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid h-16 grid-cols-4">
          {navItems.map((item) => {
            const isActive = item.isActive(pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 no-underline"
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-light)" }}
                />
                <span
                  className="font-mono text-[10px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-light)" }}
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
