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
    <section className="bg-parchment-dark py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeader
          kicker="What We Serve"
          title="The Full"
          titleItalic="Menu"
          centered
        />

        {/* Category tabs */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex border-2 border-ink">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setActiveTab(cat.slug)}
                className={`px-4 py-2.5 font-baskerville text-xs uppercase tracking-wider transition-colors duration-200 md:px-6 ${
                  activeTab === cat.slug
                    ? "bg-ink text-parchment"
                    : "bg-white text-ink-light hover:bg-parchment"
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
                className={`rounded-full px-4 py-1.5 font-lora text-xs transition-colors duration-200 ${
                  isActive
                    ? "bg-green-700 text-white"
                    : "border border-ink/20 bg-white text-ink-light hover:border-ink/40"
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
            <p className="mt-2 font-lora text-sm italic text-ink-light">
              Try removing a dietary filter to see more options.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
