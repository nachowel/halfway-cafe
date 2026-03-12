"use client";

import type { DietaryTag } from "@/types";

interface DietaryFilterProps {
  selected: DietaryTag[];
  onToggle: (tag: DietaryTag) => void;
}

const dietaryOptions: { value: DietaryTag; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
];

export default function DietaryFilter({
  selected,
  onToggle,
}: DietaryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {dietaryOptions.map((option) => {
        const isActive = selected.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`rounded-full border px-4 py-2 font-inter text-sm font-medium transition-colors duration-200 ${
              isActive
                ? "border-accent bg-accent text-white"
                : "border-border bg-white text-ink hover:bg-parchment-dark"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
