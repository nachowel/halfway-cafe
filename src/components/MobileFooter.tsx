"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { createOptionalClientComponentClient } from "@/lib/supabase";
import { toSiteSettingsMap, type SiteSettingRow } from "@/lib/site-settings";

type PlatformCard = {
  name: string;
  url: string;
  logo: string;
};

type SocialLink = {
  name: string;
  url: string;
};

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const settingKeys = [
  "social_instagram",
  "social_facebook",
  "social_tiktok",
  "delivery_ubereats",
  "delivery_ubereats_logo",
  "delivery_justeat",
  "delivery_justeat_logo",
  "delivery_deliveroo",
  "delivery_deliveroo_logo",
];

function getSiteUrl(settings: Record<string, string>, key: string): string | null {
  const value = settings[key]?.trim();
  return value && /^https?:\/\//i.test(value) ? value : null;
}

export default function MobileFooter() {
  const [deliveryPlatforms, setDeliveryPlatforms] = useState<PlatformCard[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    let isMounted = true;
    const supabase = createOptionalClientComponentClient("Mobile footer");

    if (!supabase) return () => { isMounted = false; };

    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", settingKeys)
      .then(({ data, error }) => {
        if (!isMounted || error || !data) return;

        const settings = toSiteSettingsMap(data as SiteSettingRow[]);

        const platforms: PlatformCard[] = [
          { name: "Uber Eats", url: getSiteUrl(settings, "delivery_ubereats") ?? "", logo: getSiteUrl(settings, "delivery_ubereats_logo") ?? "" },
          { name: "Just Eat", url: getSiteUrl(settings, "delivery_justeat") ?? "", logo: getSiteUrl(settings, "delivery_justeat_logo") ?? "" },
          { name: "Deliveroo", url: getSiteUrl(settings, "delivery_deliveroo") ?? "", logo: getSiteUrl(settings, "delivery_deliveroo_logo") ?? "" },
        ].filter((p) => p.url.length > 0 && p.logo.length > 0);

        const socials: SocialLink[] = [
          { name: "Instagram", url: getSiteUrl(settings, "social_instagram") ?? "" },
          { name: "Facebook", url: getSiteUrl(settings, "social_facebook") ?? "" },
          { name: "TikTok", url: getSiteUrl(settings, "social_tiktok") ?? "" },
        ].filter((s) => s.url.length > 0);

        setDeliveryPlatforms(platforms);
        setSocialLinks(socials);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="border-t border-[#E8E2D9] bg-[#151515] px-4 pb-8 pt-6">
      {/* Page Links */}
      <div className="mb-6">
        <h3 className="mb-3 font-inter text-xs font-bold uppercase tracking-wider text-orange-400">
          Pages
        </h3>
        <div className="h-px w-8 bg-[#FF6B35] mb-4" />
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

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-inter text-xs font-bold uppercase tracking-wider text-orange-400">
            Follow Us
          </h3>
          <div className="h-px w-8 bg-[#FF6B35] mb-4" />
          <div className="flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-400 no-underline transition duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                {social.name === "Instagram" ? (
                  <Instagram className="h-5 w-5" />
                ) : social.name === "Facebook" ? (
                  <Facebook className="h-5 w-5" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Platforms */}
      {deliveryPlatforms.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-inter text-xs font-bold uppercase tracking-wider text-orange-400">
            Order Online
          </h3>
          <div className="h-px w-8 bg-[#FF6B35] mb-4" />
          <div className="flex flex-wrap gap-3">
            {deliveryPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-xl border border-gray-700 bg-[#1E1E1E] px-4 py-2.5 no-underline transition-colors duration-150 hover:border-orange-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={platform.logo}
                  alt={platform.name}
                  className="w-auto object-contain"
                  style={{ maxHeight: "24px", maxWidth: "90px" }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Copyright */}
      <p className="font-inter text-xs text-gray-500">
        © 2026 Halfway Cafe · 176 Halfway St, Sidcup DA15
      </p>
    </div>
  );
}
