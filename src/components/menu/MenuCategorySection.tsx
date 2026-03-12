import type { MenuCategoryDefinition } from "@/data/menuCategories";
import { getMenuItemsByCategory } from "@/lib/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface MenuCategorySectionProps {
  category: MenuCategoryDefinition;
}

interface PublicMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  price_roll?: number | null;
  price_sandwich?: number | null;
  price_baguette?: number | null;
}

function toPublicMenuItem(row: any): PublicMenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    price_roll: row.price_roll ?? null,
    price_sandwich: row.price_sandwich ?? null,
    price_baguette: row.price_baguette ?? null,
  };
}

function getSandwichVariantPrices(item: PublicMenuItem) {
  const variantPrices = [
    item.price_roll != null ? { label: "Roll", value: item.price_roll } : null,
    item.price_sandwich != null
      ? { label: "Sandwich", value: item.price_sandwich }
      : null,
    item.price_baguette != null
      ? { label: "Baguette", value: item.price_baguette }
      : null,
  ].filter((entry): entry is { label: string; value: number } => entry !== null);

  if (variantPrices.length > 0) {
    return variantPrices;
  }

  return [{ label: "Sandwich", value: item.price }];
}

export default async function MenuCategorySection({
  category,
}: MenuCategorySectionProps) {
  const dbItems = await getMenuItemsByCategory(category.slug);
  const items = dbItems.map(toPublicMenuItem);
  const isSandwichCategory = category.slug === "sandwiches";

  return (
    <section
      id={category.slug}
      aria-labelledby={`${category.slug}-title`}
      className="scroll-mt-36 border-t border-border py-10 first:border-t-0 md:py-12"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          <h2
            id={`${category.slug}-title`}
            className="font-playfair text-3xl font-bold text-text md:text-4xl"
          >
            {category.name}
          </h2>
          <p className="mt-3 max-w-2xl font-inter text-base leading-7 text-text-mid">
            {category.description}
          </p>
        </div>

        {items.length === 0 && (
          <div className="rounded-2xl border border-border bg-bg-soft p-5">
            <p className="font-inter text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Coming Soon
            </p>
            <p className="mt-2 font-inter text-sm leading-6 text-text-mid">
              Menu items for this category will be added soon.
            </p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-white">
          {items.map((item) => {
            const sandwichVariantPrices = isSandwichCategory
              ? getSandwichVariantPrices(item)
              : [];

            return (
              <article
                key={item.id}
                className="border-b border-border px-5 py-5 last:border-b-0 md:px-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-inter text-base font-semibold text-text md:text-lg">
                    {item.name}
                  </h3>
                  {!isSandwichCategory && (
                    <span className="shrink-0 font-playfair text-lg font-bold text-accent">
                      £{item.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="mt-2 max-w-3xl font-inter text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>
                )}

                {isSandwichCategory && (
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-inter text-sm text-text-mid">
                    {sandwichVariantPrices.map((variant, index) => (
                      <span key={variant.label} className="inline-flex items-center gap-1">
                        <span className="font-medium text-text-mid">{variant.label}</span>
                        <span className="font-playfair font-bold text-accent">
                          £{variant.value.toFixed(2)}
                        </span>
                        {index < sandwichVariantPrices.length - 1 && (
                          <span className="text-text-light">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
