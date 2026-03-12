/* Footer — 4-column grid with branding, links, hours & allergen notice */

import Link from "next/link";
import { openingHours } from "@/data/opening-hours";

const menuLinks = [
  { href: "/menu/breakfast", label: "Breakfast" },
  { href: "/menu/lunch", label: "Lunch" },
  { href: "/menu/burgers", label: "Burgers" },
  { href: "/menu/desserts", label: "Desserts" },
  { href: "/menu/drinks", label: "Drinks" },
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
      <div className="border-t border-accent bg-[#151515] px-4 py-4 text-center">
        <p className="mx-auto max-w-3xl font-inter text-sm text-white/65">
          We handle allergens in our kitchen. Please speak to a member of staff
          if you have any dietary requirements or allergies before ordering.
        </p>
      </div>

      {/* Main footer */}
      <div className="border-t-4 border-accent bg-bg-dark">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:px-8 lg:grid-cols-4 lg:gap-8">
          {/* Column 1 — Branding */}
          <div>
            <Link href="/" className="no-underline">
              <span className="font-playfair text-2xl font-bold text-white">
                Halfway Cafe
              </span>
            </Link>
            <p className="mt-1 font-inter text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Est. 2008 · London
            </p>
            <p className="mt-4 font-inter text-sm leading-relaxed text-gray-400">
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
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-gray-600 font-inter text-xs font-bold text-gray-300 no-underline transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Menu links */}
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

          {/* Column 3 — Page links */}
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

          {/* Column 4 — Opening hours */}
          <div>
            <h3 className="font-inter text-xs font-bold uppercase tracking-wider text-orange-400">
              Opening Hours
            </h3>
            <div className="mb-4 mt-1 h-px w-8 bg-accent" />
            <ul className="flex flex-col gap-2">
              {openingHours.map((entry) => (
                <li
                  key={entry.day}
                  className="flex justify-between gap-4 font-inter text-sm"
                >
                  <span className="font-inter text-gray-400">{entry.day}</span>
                  <span className="text-right font-inter text-gray-500">
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
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 md:flex-row md:px-8">
            <p className="font-inter text-xs text-gray-500">
              © {new Date().getFullYear()} Halfway Cafe. All rights reserved.
            </p>
            <p className="font-inter text-xs text-gray-500">
              🍳 Proudly serving London since 2008
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
