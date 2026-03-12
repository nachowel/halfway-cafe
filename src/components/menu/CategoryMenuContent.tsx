"use client";

import { useState } from "react";
import DietaryFilter from "@/components/menu/DietaryFilter";
import DishCard from "@/components/ui/DishCard";
import type { DietaryTag, MenuItem } from "@/types";

interface CategoryMenuContentProps {
  categoryName: string;
  items: MenuItem[];
}

export default function CategoryMenuContent({
  categoryName,
  items,
}: CategoryMenuContentProps) {
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag[]>([]);

  const filteredItems =
    selectedDietary.length === 0
      ? items
      : items.filter((item) =>
          selectedDietary.every((tag) => item.dietary.includes(tag))
        );

  const toggleDietary = (tag: DietaryTag) => {
    setSelectedDietary((current) =>
      current.includes(tag)
        ? current.filter((entry) => entry !== tag)
        : [...current, tag]
    );
  };

  return (
    <div className="flex-1">
      <div className="border-b border-border pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-playfair text-4xl font-bold text-ink md:text-5xl">
              {categoryName}
            </h1>
            <p className="mt-2 font-lora text-base italic text-ink-light">
              {items.length} item{items.length === 1 ? "" : "s"} on this menu.
            </p>
          </div>

          <DietaryFilter selected={selectedDietary} onToggle={toggleDietary} />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {filteredItems.map((item) => (
            <DishCard key={item.id} item={item} variant="menu" />
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-border bg-white px-6 py-12 text-center">
          <p className="font-playfair text-2xl text-ink">No dishes match these filters.</p>
          <p className="mt-2 font-lora text-sm italic text-ink-light">
            Try removing one of the dietary options to see more dishes.
          </p>
        </div>
      )}
    </div>
  );
}
