/* Footer — local SEO copy, dynamic opening hours, and social links */

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import FooterOpeningHours, {
  type FooterHoursEntry,
} from "@/components/layout/FooterOpeningHours";
import { HALFWAY_CAFE_PHONE_DISPLAY } from "@/lib/contact";
import { getLondonWeekdayName } from "@/lib/london-time";
import { markPublicDataUncacheable } from "@/lib/public-cache";
import { toSiteSettingsMap, type SiteSettingRow } from "@/lib/site-settings";
import { createPublicServerClient } from "@/lib/supabase-public";
import type { OpeningHours } from "@/types";

interface FooterProps {
  openingHours: OpeningHours[];
}

const menuLinks = [
  { href: "/menu/breakfast", label: "Breakfast" },
  { href: "/menu/sandwiches", label: "Sandwiches" },
  { href: "/menu/burgers", label: "Burgers" },
  { href: "/menu/lunch", label: "Lunch" },
  { href: "/menu/panini", label: "Panini" },
  { href: "/menu/drinks", label: "Drinks" },
];

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const exploreSidcupLinks = [
  { href: "/breakfast-sidcup", label: "Breakfast in Sidcup" },
  { href: "/cafe-sidcup", label: "Cafe in Sidcup" },
  { href: "/coffee-shop-sidcup", label: "Coffee Shop in Sidcup" },
  { href: "/cafe-near-sidcup-station", label: "Cafe Near Sidcup Station" },
  { href: "/brunch-sidcup", label: "Brunch in Sidcup" },
  { href: "/full-english-breakfast-sidcup", label: "Full English Breakfast in Sidcup" },
  { href: "/takeaway-sidcup", label: "Takeaway in Sidcup" },
  { href: "/bacon-sandwich-sidcup", label: "Bacon Sandwich in Sidcup" },
  { href: "/pancakes-sidcup", label: "Pancakes in Sidcup" },
  { href: "/eggs-benedict-sidcup", label: "Eggs Benedict in Sidcup" },
  { href: "/breakfast-da15", label: "Breakfast in DA15" },
];

const fallbackHours: FooterHoursEntry[] = [
  { label: "Mon – Sat:", value: "7:00am – 3:00pm", isWeekday: true, isToday: false },
  { label: "Sunday:", value: "9:00am – 2:00pm", isWeekday: false, isToday: false },
];

function mapHoursToFooterEntries(rows: OpeningHours[]): FooterHoursEntry[] {
  const isSunday = getLondonWeekdayName() === "Sunday";

  // Footer hours are intentionally shown in a canonical two-line format.
  if (rows.length === 0) {
    return fallbackHours.map((entry) => ({
      ...entry,
      isToday: entry.isWeekday ? !isSunday : isSunday,
    }));
  }

  return fallbackHours.map((entry) => ({
    ...entry,
    isToday: entry.isWeekday ? !isSunday : isSunday,
  }));
}

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-400 no-underline transition duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
    >
      {children}
    </a>
  );
}

function getSocialHref(settings: Record<string, string>, key: string) {
  const value = settings[key]?.trim();

  return value && /^https?:\/\//i.test(value) ? value : "#";
}

export default async function Footer({ openingHours }: FooterProps) {
  const hours = mapHoursToFooterEntries(openingHours);
  const supabase = createPublicServerClient();
  let socialSettings: Record<string, string> = {
    social_instagram: "https://instagram.com/halfwaycafesidcup",
    social_facebook: "https://facebook.com/profile.php?id=61580807168670",
    social_tiktok: "https://tiktok.com/@halfwaycafesidcup",
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["social_instagram", "social_facebook", "social_tiktok"]);

    if (error) {
      markPublicDataUncacheable("Footer social links", error);
    } else if (data && data.length > 0) {
      socialSettings = toSiteSettingsMap(data as SiteSettingRow[]);
      console.log("Footer social links loaded:", Object.keys(socialSettings));
    } else {
      console.warn("Footer social links: no data returned from Supabase");
    }
  } else {
    markPublicDataUncacheable(
      "Footer social links",
      new Error("Supabase public environment is not configured.")
    );
  }

  const instagramHref = getSocialHref(socialSettings, "social_instagram");
  const facebookHref = getSocialHref(socialSettings, "social_facebook");
  const tiktokHref = getSocialHref(socialSettings, "social_tiktok");

  return (
    <footer>
      <div className="border-t border-accent bg-[#151515] px-4 py-4 text-center">
        <p className="mx-auto max-w-3xl font-inter text-sm text-white/65">
          We handle allergens in our kitchen. Please speak to a member of staff
          if you have any dietary requirements or allergies before ordering.
        </p>
      </div>

      <div className="border-t-4 border-accent bg-bg-dark">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8 lg:grid-cols-5 lg:gap-8">
          <div>
            <Link href="/" className="no-underline">
              <span className="font-playfair text-2xl font-bold text-white">
                HALFWAY CAFE · SIDCUP
              </span>
            </Link>
            <p className="mt-4 font-inter text-sm leading-relaxed text-gray-400">
              A family-run cafe in Sidcup, DA15, serving the local community for
              over 20 years. Visit us at 176 Halfway St for a full English
              breakfast, fresh lunch, and proper coffee.
            </p>
            <p className="mt-3 font-inter text-sm text-gray-500">
              Serving Sidcup, DA15 and the wider London area.
            </p>
            <p className="mt-3 font-inter text-sm leading-relaxed text-gray-400">
              Halfway Cafe is a breakfast and brunch cafe in Sidcup, serving full
              English breakfast, sandwiches, and coffee daily. Located at 176 Halfway
              Street, we are a popular local spot for a proper London caff experience.
            </p>
            <div className="mt-5 space-y-2 font-inter text-sm text-gray-400">
              <p>📍 176 Halfway St, Sidcup DA15 8DJ</p>
              <p>📞 {HALFWAY_CAFE_PHONE_DISPLAY}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <SocialIconLink href={instagramHref} label="Instagram">
                <Instagram className="h-5 w-5" />
              </SocialIconLink>
              <SocialIconLink href={facebookHref} label="Facebook">
                <Facebook className="h-5 w-5" />
              </SocialIconLink>
              <SocialIconLink href={tiktokHref} label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </SocialIconLink>
            </div>
          </div>

          <div>
            <h3 className="font-inter text-xs font-bold uppercase tracking-wider text-orange-400">
              Menu
            </h3>
            <div className="mb-4 mt-1 h-px w-8 bg-accent" />
            <ul className="flex flex-col gap-2.5">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-inter text-sm text-gray-400 no-underline transition-colors duration-200 hover:text-orange-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-inter text-xs font-bold uppercase tracking-wider text-orange-400">
              Pages
            </h3>
            <div className="mb-4 mt-1 h-px w-8 bg-accent" />
            <ul className="flex flex-col gap-2.5">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-inter text-sm text-gray-400 no-underline transition-colors duration-200 hover:text-orange-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-inter text-xs font-bold uppercase tracking-wider text-orange-400">
              Explore Sidcup
            </h3>
            <div className="mb-4 mt-1 h-px w-8 bg-accent" />
            <ul className="flex flex-col gap-2.5">
              {exploreSidcupLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-inter text-sm text-gray-400 no-underline transition-colors duration-200 hover:text-orange-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-inter text-xs font-bold uppercase tracking-wider text-orange-400">
              Opening Hours
            </h3>
            <div className="mb-4 mt-1 h-px w-8 bg-accent" />
            <FooterOpeningHours hours={hours} />
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 md:flex-row md:px-8">
            <p className="font-inter text-xs text-gray-500">
              © 2026 Halfway Cafe. All rights reserved.
            </p>
            <p className="font-inter text-xs text-gray-500">
              Proudly serving Sidcup, DA15 · 176 Halfway St
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
