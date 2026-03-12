/* MenuSection — Full menu with category tabs & dietary filters */

"use client";

import { useState, useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import DishCard from "@/components/ui/DishCard";
import type { MenuItem, MenuCategory, DietaryTag } from "@/types";

interface CategoryTab {
  slug: string;
  name: string;
}

interface MenuSectionProps {
  items: MenuItem[];
  categories: CategoryTab[];
}

const dietaryOptions: { value: DietaryTag; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
];

export default function MenuSection({ items, categories }: MenuSectionProps) {
  const [activeTab, setActiveTab] = useState<MenuCategory>(
    categories[0]?.slug ?? "breakfast"
  );
  const [dietaryFilters, setDietaryFilters] = useState<DietaryTag[]>([]);

  const toggleDietary = (tag: DietaryTag) => {
    setDietaryFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredItems = useMemo(() => {
    const byCategory = items.filter((item) => item.category === activeTab);
    if (dietaryFilters.length === 0) return byCategory;
    return byCategory.filter((item) =>
      dietaryFilters.every((tag) => item.dietary.includes(tag))
    );
  }, [items, activeTab, dietaryFilters]);

  return (
    <section className="bg-bg-soft py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          kicker="What We Serve"
          title="The Full"
          titleItalic="Menu"
          centered
        />

        {/* Category tabs */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveTab(cat.slug)}
                className={`rounded-full border px-4 py-2.5 font-inter text-xs font-bold uppercase tracking-[0.14em] transition-colors duration-200 md:px-6 ${
                  activeTab === cat.slug
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-text-mid hover:border-accent hover:text-accent"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary filter pills */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {dietaryOptions.map((opt) => {
            const isActive = dietaryFilters.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleDietary(opt.value)}
                className={`rounded-full px-4 py-2 font-inter text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-200 ${
                  isActive
                    ? "bg-accent text-white"
                    : "border border-border bg-white text-text-mid hover:border-accent hover:text-accent"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Menu cards grid */}
        <div
          key={`${activeTab}-${dietaryFilters.join(",")}`}
          className="mt-10 grid animate-fade-in gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredItems.map((item) => (
            <DishCard key={item.id} item={item} variant="menu" />
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="mt-10 animate-fade-in text-center">
            <p className="font-playfair text-2xl text-ink/40">
              No items match your filters
            </p>
            <p className="mt-2 font-inter text-sm text-text-mid">
              Try removing a dietary filter to see more options.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
