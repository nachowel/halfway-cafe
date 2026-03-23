"use client";

import { useState } from "react";
import Link from "next/link";
import DietaryFilter from "@/components/menu/DietaryFilter";
import DishCard from "@/components/ui/DishCard";
import type { DietaryTag, MenuItem } from "@/types";

interface CategoryMenuContentProps {
  categoryName: string;
  items: MenuItem[];
  headingLevel?: "h1" | "h2";
}

export default function CategoryMenuContent({
  categoryName,
  items,
  headingLevel,
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
            {(() => {
              const Heading = headingLevel ?? "h1";
              return (
                <Heading className="font-playfair text-4xl font-bold text-ink md:text-5xl">
                  {categoryName}
                </Heading>
              );
            })()}
            <p className="mt-2 font-lora text-base italic text-ink-light">
              {items.length} item{items.length === 1 ? "" : "s"} on this menu.
              {categoryName === "Breakfast" ? (
                <>
                  {" "}Looking for{" "}
                  <Link href="/breakfast-sidcup" className="text-accent underline hover:text-accent/80">
                    breakfast in Sidcup
                  </Link>
                  ? Need{" "}
                  <Link href="/takeaway-sidcup" className="text-accent underline hover:text-accent/80">
                    takeaway breakfast in Sidcup
                  </Link>
                  ? For a proper cooked plate, see{" "}
                  <Link
                    href="/full-english-breakfast-sidcup"
                    className="text-accent underline hover:text-accent/80"
                  >
                    full English breakfast in Sidcup
                  </Link>
                  .
                </>
              ) : null}
              {categoryName === "Sandwiches" ? (
                <>
                  {" "}Try our{" "}
                  <Link href="/bacon-sandwich-sidcup" className="text-accent underline hover:text-accent/80">
                    bacon sandwich in Sidcup
                  </Link>
                  , or order{" "}
                  <Link href="/takeaway-sidcup" className="text-accent underline hover:text-accent/80">
                    takeaway in Sidcup
                  </Link>
                  {" "}if you&apos;re on the go.
                </>
              ) : null}
              {categoryName === "Drinks" ? (
                <>
                  {" "}Looking for a{" "}
                  <Link href="/coffee-shop-sidcup" className="text-accent underline hover:text-accent/80">
                    coffee shop in Sidcup
                  </Link>
                  ? If you&apos;re stopping{" "}
                  <Link
                    href="/cafe-near-sidcup-station"
                    className="text-accent underline hover:text-accent/80"
                  >
                    near Sidcup Station
                  </Link>
                  , this is an easy local stop for quick drinks.
                </>
              ) : null}
              {categoryName === "Sides & Extras" ? (
                <>
                  {" "}You can{" "}
                  <Link href="/takeaway-sidcup" className="text-accent underline hover:text-accent/80">
                    add extras to your takeaway order
                  </Link>
                  {" "}or pair your add-ons with{" "}
                  <Link href="/breakfast-sidcup" className="text-accent underline hover:text-accent/80">
                    breakfast in Sidcup
                  </Link>
                  .
                </>
              ) : null}
              {categoryName === "Kids Menu" ? (
                <>
                  {" "}All served at{" "}
                  <Link href="/cafe-sidcup" className="text-accent underline hover:text-accent/80">
                    our cafe in Sidcup
                  </Link>
                  , with{" "}
                  <Link href="/takeaway-sidcup" className="text-accent underline hover:text-accent/80">
                    takeaway
                  </Link>
                  {" "}available too.
                </>
              ) : null}
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
