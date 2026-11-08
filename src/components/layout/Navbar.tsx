/* Navbar — Sticky white header with modern CTA and mobile menu */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ResponsivePublicImage from "@/components/ui/ResponsivePublicImage";
import type { ResolvedPublicImage } from "@/types/public-image";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ logoImage }: { logoImage: ResolvedPublicImage }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!mobileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  const navShellClass = isHomePage
    ? scrolled
      ? "border-white/10 bg-[rgba(20,20,20,0.78)] shadow-lg backdrop-blur-xl"
      : "border-white/10 bg-[rgba(20,20,20,0.45)] backdrop-blur-xl"
    : "border-border bg-white/95 shadow-sm backdrop-blur";
  const linkTextClass = isHomePage
    ? "text-white/88 hover:text-white"
    : "text-text hover:text-accent";
  const mobileButtonClass = isHomePage ? "text-white" : "text-text";
  const mobilePanelClass = isHomePage
    ? "border-white/10 bg-[rgba(20,20,20,0.88)] backdrop-blur-xl"
    : "border-border bg-white";
  const mobileLinkClass = isHomePage
    ? "text-white/88 hover:bg-white/10 hover:text-white"
    : "text-text hover:bg-bg-soft hover:text-accent";

  return (
    <nav
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${navShellClass}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <ResponsivePublicImage
            image={logoImage}
            alt="Halfway Cafe logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span
            className="font-playfair text-2xl font-black tracking-tight"
            style={{
              color: isHomePage && !scrolled ? "#FF6B35" : isHomePage && scrolled ? "#ffffff" : "#1A1A1A",
            }}
          >
            Halfway Cafe
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative font-inter text-sm font-medium no-underline transition-colors duration-200 ${
                    isActive ? "text-accent" : linkTextClass
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-accent" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/contact"
          className="hidden rounded-full bg-accent px-5 py-2.5 font-inter text-xs font-bold uppercase tracking-[0.16em] !text-white no-underline transition-colors duration-200 hover:bg-[#E55A2B] md:inline-block"
        >
          Visit Today
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className={`flex flex-col gap-1.5 md:hidden ${mobileButtonClass}`}
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

      <div
        className={`overflow-hidden border-t transition-all duration-300 md:hidden ${mobilePanelClass} ${
          mobileOpen ? "max-h-96" : "max-h-0 border-t-0"
        }`}
      >
        <div className="flex flex-col gap-2 px-4 pb-6 pt-4">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 font-inter text-sm font-medium no-underline transition-colors duration-200 ${
                  isActive
                    ? "bg-accent text-white"
                    : mobileLinkClass
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/contact"
            className="mt-2 rounded-full bg-accent px-5 py-3 text-center font-inter text-xs font-bold uppercase tracking-[0.16em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
          >
            Visit Today
          </Link>
        </div>
      </div>
    </nav>
  );
}
