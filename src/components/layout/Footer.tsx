/* Footer — 4-column grid with branding, links, hours & allergen notice */

import Link from "next/link";
import { openingHours } from "@/data/opening-hours";

const menuLinks = [
  { href: "/menu?category=breakfast", label: "Breakfast" },
  { href: "/menu?category=lunch", label: "Lunch" },
  { href: "/menu?category=burgers", label: "Burgers" },
  { href: "/menu?category=desserts", label: "Desserts" },
  { href: "/menu?category=drinks", label: "Drinks" },
];

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  { href: "https://instagram.com", label: "IG", ariaLabel: "Instagram" },
  { href: "https://facebook.com", label: "FB", ariaLabel: "Facebook" },
  { href: "https://x.com", label: "X", ariaLabel: "X (Twitter)" },
];

export default function Footer() {
  return (
    <footer>
      {/* Allergen notice bar */}
      <div className="bg-parchment-dark px-4 py-4 text-center">
        <p className="mx-auto max-w-3xl font-lora text-sm italic text-ink-light">
          We handle allergens in our kitchen. Please speak to a member of staff
          if you have any dietary requirements or allergies before ordering.
        </p>
      </div>

      {/* Main footer */}
      <div className="border-t-4 border-red bg-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8 lg:grid-cols-4 lg:gap-8">
          {/* Column 1 — Branding */}
          <div>
            <Link href="/" className="no-underline">
              <span className="font-playfair text-2xl font-bold italic text-gold">
                Halfway Cafe
              </span>
            </Link>
            <p className="mt-1 font-baskerville text-xs uppercase tracking-widest text-parchment/50">
              Est. 2008 · London
            </p>
            <p className="mt-4 font-lora text-sm italic leading-relaxed text-parchment/60">
              A proper London caff. Full English breakfasts, honest grub &
              builder&apos;s tea — no fuss, no frills, just good food.
            </p>

            {/* Social buttons */}
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="flex h-[38px] w-[38px] items-center justify-center border border-parchment/20 font-baskerville text-xs text-parchment/60 no-underline transition-all duration-200 hover:border-red hover:bg-red hover:text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Menu links */}
          <div>
            <h3 className="font-playfair text-base font-bold text-gold">
              Menu
            </h3>
            <div className="mt-1 mb-4 h-px w-8 bg-red" />
            <ul className="flex flex-col gap-2.5">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-lora text-sm text-parchment/70 no-underline transition-colors duration-200 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Page links */}
          <div>
            <h3 className="font-playfair text-base font-bold text-gold">
              Pages
            </h3>
            <div className="mt-1 mb-4 h-px w-8 bg-red" />
            <ul className="flex flex-col gap-2.5">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-lora text-sm text-parchment/70 no-underline transition-colors duration-200 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Opening hours */}
          <div>
            <h3 className="font-playfair text-base font-bold text-gold">
              Opening Hours
            </h3>
            <div className="mt-1 mb-4 h-px w-8 bg-red" />
            <ul className="flex flex-col gap-2">
              {openingHours.map((entry) => (
                <li
                  key={entry.day}
                  className="flex justify-between font-lora text-sm"
                >
                  <span className="text-parchment/70">{entry.day}</span>
                  <span className="text-parchment/50">
                    {entry.closed
                      ? "Closed"
                      : `${entry.open} – ${entry.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-parchment/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 md:flex-row md:px-8">
            <p className="font-lora text-xs text-parchment/40">
              © {new Date().getFullYear()} Halfway Cafe. All rights reserved.
            </p>
            <p className="font-lora text-xs text-parchment/40">
              🍳 Proudly serving London since 2008
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
