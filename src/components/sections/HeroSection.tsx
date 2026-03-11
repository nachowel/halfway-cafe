/* HeroSection — Full-viewport hero with parallax bg, text & info card */

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import OpenStatus from "@/components/ui/OpenStatus";
import type { OpeningHours } from "@/types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1800&q=85";

interface HeroSectionProps {
  openingHours: OpeningHours[];
}

export default function HeroSection({ openingHours }: HeroSectionProps) {
  const [offsetY, setOffsetY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // ─── Parallax effect ───
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.bottom > 0) {
        setOffsetY(window.scrollY * 0.35);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[700px] items-center overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Background image with parallax */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        <Image
          src={HERO_IMAGE}
          alt="Inside Halfway Cafe — warm, inviting London greasy spoon"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 md:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — Text */}
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="block h-px w-10 bg-red" />
              <span className="font-baskerville text-xs uppercase tracking-widest text-gold-light">
                London&apos;s Favourite Caff Since 2008
              </span>
            </div>

            {/* H1 */}
            <h1
              className="mt-6 font-playfair font-black leading-none text-white"
              style={{ fontSize: "clamp(62px, 8vw, 110px)" }}
            >
              Halfway
              <br />
              <span className="italic">Cafe</span>
            </h1>

            {/* Tagline */}
            <p className="mt-5 font-lora text-xl italic text-gold-light">
              Breakfast · Lunch · Dinner
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="bg-red px-7 py-3.5 font-baskerville text-xs uppercase tracking-wider text-white no-underline transition-colors duration-200 hover:bg-red-dark"
              >
                See Full Menu
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=123+High+Street+London+EC1A+1BB"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/60 px-7 py-3.5 font-baskerville text-xs uppercase tracking-wider text-white no-underline transition-all duration-200 hover:border-white hover:bg-white/10"
              >
                Get Directions
              </a>
            </div>
          </div>

          {/* Right — Info card */}
          <div className="border-t-4 border-red bg-ink p-6 md:p-8">
            {/* Opening hours heading */}
            <h2 className="font-baskerville text-xs uppercase tracking-widest text-gold">
              Opening Hours
            </h2>

            {/* Hours list */}
            <ul className="mt-5 flex flex-col gap-2.5">
              {openingHours.map((entry) => (
                <li
                  key={entry.day}
                  className="flex items-center justify-between pb-2.5 font-lora text-sm"
                  style={{ borderBottom: "1px solid rgba(242, 235, 224, 0.1)" }}
                >
                  <span style={{ color: "rgba(242, 235, 224, 0.55)" }}>
                    {entry.day}
                  </span>
                  <span className="text-parchment">
                    {entry.closed
                      ? "Closed"
                      : `${entry.open} – ${entry.close}`}
                  </span>
                </li>
              ))}
            </ul>

            {/* Open status */}
            <div className="mt-5">
              <OpenStatus />
            </div>

            {/* Divider */}
            <div className="my-5 h-px" style={{ backgroundColor: "rgba(242, 235, 224, 0.1)" }} />

            {/* Address */}
            <p
              className="flex items-start gap-2 font-lora text-sm"
              style={{ color: "rgba(242, 235, 224, 0.7)" }}
            >
              <span className="shrink-0">📍</span>
              <span>123 High Street, London EC1A 1BB</span>
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="font-baskerville text-[10px] uppercase tracking-widest text-white/50">
          Scroll
        </span>
        <span className="block h-8 w-px animate-bounce bg-white/40" />
      </div>
    </section>
  );
}
