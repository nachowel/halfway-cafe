/* HeroSection — Full-screen cafe hero with centered copy and floating status card */

"use client";

import Image from "next/image";
import Link from "next/link";
import OpenStatus from "@/components/ui/OpenStatus";
import type { OpeningHours } from "@/types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1800&q=85";
const DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=123+High+Street+London+EC1A+1BB";
const CAFE_ADDRESS = "123 High Street, London EC1A 1BB";

interface HeroSectionProps {
  openingHours: OpeningHours[];
}

function getTodayHours(hours: OpeningHours[]): string {
  const dayName = new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(new Date());
  const today = hours.find((entry) => entry.day.toLowerCase() === dayName.toLowerCase());

  if (!today) {
    return "Hours available in store";
  }

  if (today.closed) {
    return "Closed today";
  }

  return `${today.open} - ${today.close}`;
}

export default function HeroSection({ openingHours }: HeroSectionProps) {
  const todayHours = getTodayHours(openingHours);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark">
      <Image
        src={HERO_IMAGE}
        alt="Inside Halfway Cafe with warm light, busy tables, and classic breakfast plates"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-[rgba(0,0,0,0.45)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,200,87,0.14),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl justify-center px-6 py-28 text-center sm:px-8">
        <div className="max-w-3xl">
          <span className="mx-auto block h-px w-16 bg-yellow" />

          <h1
            className="mt-8 font-playfair text-[clamp(56px,8vw,96px)] font-black leading-[0.95] text-white"
            style={{ fontVariationSettings: '"wght" 900' }}
          >
            Halfway Cafe
          </h1>

          <p className="mt-5 font-inter text-xl italic text-yellow sm:text-2xl">
            Breakfast · Lunch · Dinner
          </p>

          <span className="mx-auto mt-6 block h-px w-16 bg-yellow" />

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/menu"
              className="rounded-full bg-accent px-8 py-3 font-inter text-sm font-bold uppercase tracking-[0.16em] text-white no-underline transition-colors duration-200 hover:bg-accent-dark"
            >
              See Our Menu
            </Link>

            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/80 bg-transparent px-8 py-3 font-inter text-sm font-bold uppercase tracking-[0.16em] text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 text-white/72 md:bottom-8 md:left-8">
        <span className="font-inter text-[11px] font-bold uppercase tracking-[0.35em]">Scroll</span>
        <span className="flex h-10 w-5 items-start justify-center rounded-full border border-white/30 p-1">
          <span className="block h-2 w-2 animate-bounce rounded-full bg-yellow" />
        </span>
      </div>

      <div className="absolute bottom-6 left-4 right-4 z-10 min-w-[280px] rounded-xl border border-accent/15 bg-white p-6 shadow-xl sm:left-auto sm:right-8 sm:max-w-sm md:bottom-8">
        <OpenStatus variant="hero" />

        <p className="mt-4 font-inter text-sm font-medium text-text-mid">
          Today&apos;s hours: {todayHours}
        </p>

        <p className="mt-2 text-sm leading-6 text-text-light">{CAFE_ADDRESS}</p>
      </div>
    </section>
  );
}
