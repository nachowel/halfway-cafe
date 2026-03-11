/* Navbar — Sticky header with scroll-aware styling & mobile hamburger */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // ─── Scroll listener ───
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll(); // check on mount
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Close mobile menu on outside click ───
  useEffect(() => {
    if (!mobileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  // ─── Close mobile menu on route change ───
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const bgClass = scrolled
    ? "bg-ink shadow-md"
    : "bg-transparent";

  const textClass = scrolled
    ? "text-parchment"
    : "text-white";

  return (
    <nav
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${bgClass}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red text-lg text-white">
            🍳
          </span>
          <span
            className={`font-playfair text-xl font-bold transition-colors duration-300 ${textClass}`}
          >
            Halfway Cafe
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative font-lora text-sm tracking-wide no-underline transition-colors duration-200 ${textClass} hover:text-gold`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-gold" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA */}
        <Link
          href="/contact"
          className="hidden font-baskerville text-xs uppercase tracking-[0.15em] text-white no-underline transition-colors duration-200 hover:bg-red-dark md:inline-block md:bg-red md:px-5 md:py-2.5"
        >
          Visit Today
        </Link>

        {/* Mobile hamburger button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className={`flex flex-col gap-1.5 md:hidden ${textClass}`}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              mobileOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              mobileOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden bg-ink transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-96 border-t border-ink-light" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 pb-6 pt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-2.5 font-lora text-sm tracking-wide no-underline transition-colors duration-200 ${
                  isActive
                    ? "bg-ink-light text-gold"
                    : "text-parchment hover:bg-ink-light hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Mobile CTA */}
          <Link
            href="/contact"
            className="mt-3 bg-red px-5 py-2.5 text-center font-baskerville text-xs uppercase tracking-[0.15em] text-white no-underline transition-colors duration-200 hover:bg-red-dark"
          >
            Visit Today
          </Link>
        </div>
      </div>
    </nav>
  );
}
