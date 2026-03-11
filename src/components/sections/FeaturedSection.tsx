/* FeaturedSection — Chef's picks grid with scroll-reveal animation */

"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import DishCard from "@/components/ui/DishCard";
import type { MenuItem } from "@/types";

interface FeaturedSectionProps {
  items: MenuItem[];
}

export default function FeaturedSection({ items }: FeaturedSectionProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // ─── Intersection Observer for reveal ───
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden bg-parchment py-24">
      {/* Decorative red dashed border strip */}
      <div
        className="absolute inset-x-0 top-0 h-2"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--color-red) 0px, var(--color-red) 12px, transparent 12px, transparent 24px)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          kicker="Chef's Picks"
          title="Our"
          titleItalic="Favourites"
          subtitle="The dishes that keep them coming back, week after week."
          centered
        />

        {/* Cards grid */}
        <div
          ref={gridRef}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible
                  ? "translateY(0)"
                  : "translateY(24px)",
                transitionDelay: visible ? `${i * 80}ms` : "0ms",
              }}
            >
              <DishCard item={item} variant="featured" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
