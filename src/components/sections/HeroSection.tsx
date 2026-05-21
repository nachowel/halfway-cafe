"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HALFWAY_CAFE_DIRECTIONS_URL } from "@/lib/maps";
import OpenStatus from "@/components/ui/OpenStatus";
import HomeMarquee from "@/components/sections/HomeMarquee";
import type { OpeningHours } from "@/types";

const CAFE_ADDRESS = "176 Halfway Street, Sidcup DA15 8DJ";

interface HeroSectionProps {
  openingHours: OpeningHours[];
  heroImageUrl?: string | null;
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

export default function HeroSection({ openingHours, heroImageUrl }: HeroSectionProps) {
  const todayHours = getTodayHours(openingHours);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    // Respect user prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY;
      // Soft, very subtle scroll parallax capped at 20px
      setTranslateY(Math.min(20, scrolled * 0.05));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-bg text-text">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(216,95,47,0.04)_0_1px,transparent_1px_100%),linear-gradient(180deg,rgba(27,23,19,0.03)_0_1px,transparent_1px_100%)] bg-[size:72px_72px]" />

        <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex items-start px-6 pb-10 pt-28 sm:px-8 lg:px-14 lg:pb-6 lg:pt-24 xl:px-20 xl:pb-10 xl:pt-28">
            <div className="w-full max-w-2xl">
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.26em] text-accent">
                Family-run British caff · Sidcup DA15
              </p>

              <div className="mt-5 h-px w-20 bg-rule-strong" />

              <h1
                className="mt-5 max-w-[10ch] font-playfair text-[clamp(42px,5.8vw,90px)] font-black leading-[0.86] text-text"
                style={{ fontVariationSettings: '"wght" 900' }}
              >
                Best Breakfast in Sidcup
              </h1>

              <p className="mt-5 font-playfair text-[clamp(23px,2.2vw,31px)] italic leading-tight text-accent-dark">
                Full English, sandwiches &amp; proper coffee
              </p>

              <p className="mt-3 font-inter text-base font-semibold text-text-mid sm:text-lg">
                Big portions · Quick service · No booking needed
              </p>

              <p className="mt-1 font-inter text-sm font-medium uppercase tracking-[0.18em] text-text-light">
                176 Halfway Street, Sidcup DA15
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/menu"
                  className="btn-editorial btn-editorial-accent rounded-full border border-accent bg-accent px-7 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-white no-underline hover:border-accent-dark hover:bg-accent-dark hover:text-white focus:text-white active:text-white"
                >
                  View Menu
                </Link>

                <a
                  href={HALFWAY_CAFE_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-editorial btn-editorial-secondary rounded-full border border-rule-strong bg-bg-soft px-7 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-text no-underline hover:border-accent hover:bg-white hover:text-accent-dark"
                >
                  Get Directions
                </a>
              </div>

              <div className="mt-5 max-w-[540px] border border-rule bg-bg-soft p-4 shadow-[0_18px_50px_rgba(27,23,19,0.08)] sm:p-5">
                <OpenStatus variant="hero" />

                <div className="mt-4 grid gap-4 border-t border-rule pt-4 sm:grid-cols-[0.85fr_1.45fr]">
                  <div>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-text-light">
                      Today&apos;s hours
                    </p>
                    <p className="mt-1 font-inter text-base font-semibold text-text">
                      {todayHours}
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-text-light">
                      Address
                    </p>
                    <p className="mt-1 font-inter text-sm leading-6 text-text-mid">
                      {CAFE_ADDRESS}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[38vh] overflow-hidden border-t border-rule bg-bg-dark lg:min-h-screen lg:border-l lg:border-t-0">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt="Inside Halfway Cafe in Sidcup during a busy breakfast service"
                fill
                priority
                className="object-cover object-center transition-transform duration-75 ease-out"
                style={{ transform: `translate3d(0, ${translateY}px, 0)` }}
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            ) : null}

            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,15,11,0.38),rgba(19,15,11,0.04)_38%,rgba(19,15,11,0.12))]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(19,15,11,0.48),transparent)]" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 border-t border-rule-light pt-4 text-white/90 sm:bottom-8 sm:left-8 sm:right-8">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em]">
                Breakfast served daily
              </p>
              <p className="hidden font-playfair text-3xl italic text-yellow sm:block">
                Since 2003
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomeMarquee />
    </>
  );
}

