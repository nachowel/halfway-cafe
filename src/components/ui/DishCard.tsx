/* DishCard — Menu item card with featured & menu variants */

import Image from "next/image";
import type { MenuItem, DietaryTag } from "@/types";

interface DishCardProps {
  item: MenuItem;
  variant: "featured" | "menu";
}

const dietaryBadge: Record<DietaryTag, { label: string; className: string }> = {
  vegetarian: {
    label: "V",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  vegan: {
    label: "VG",
    className: "bg-green-200 text-green-900 border-green-400",
  },
  "gluten-free": {
    label: "GF",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
};

export default function DishCard({ item, variant }: DishCardProps) {
  if (variant === "featured") {
    return <FeaturedCard item={item} />;
  }
  return <MenuCard item={item} />;
}

// ─── Featured Variant ───

function FeaturedCard({ item }: { item: MenuItem }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-[220px] w-full overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-parchment-dark">
            <span className="font-playfair text-4xl text-ink/20">🍳</span>
          </div>
        )}

        {/* Must Try ribbon */}
        {item.featured && (
          <div className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5">
            <span className="font-inter text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Must Try
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-playfair text-lg font-bold text-ink">
          {item.name}
        </h3>
        <p className="mt-2 font-inter text-sm leading-relaxed text-text-mid">
          {item.description}
        </p>
        <p className="mt-4 font-playfair text-xl font-bold text-accent">
          £{item.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

// ─── Menu Variant ───

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative h-[190px] w-full overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-parchment-dark">
            <span className="font-playfair text-4xl text-ink/20">🍳</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name + Price row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-playfair text-base font-bold text-ink">
            {item.name}
          </h3>
          <span className="shrink-0 font-playfair text-base font-bold text-accent">
            £{item.price.toFixed(2)}
          </span>
        </div>

        {/* Description */}
        <p className="mt-2 font-inter text-sm leading-relaxed text-text-mid">
          {item.description}
        </p>

        {/* Dietary badges */}
        {item.dietary.length > 0 && (
          <div className="mt-3 flex gap-2">
            {item.dietary.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-full border px-2 py-1 font-inter text-[11px] font-bold uppercase tracking-[0.08em] ${dietaryBadge[tag].className}`}
              >
                {dietaryBadge[tag].label}
              </span>
            ))}
          </div>
        )}

        {/* Spacer to push allergen warning to bottom */}
        <div className="flex-1" />

        {/* Allergen warning */}
        <p className="mt-4 border-t border-border pt-3 font-inter text-xs text-text-light">
          ⚠️ Allergies? Please inform a member of staff before ordering.
        </p>
      </div>
    </div>
  );
}
