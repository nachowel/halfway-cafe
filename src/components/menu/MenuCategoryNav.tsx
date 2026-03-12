import Link from "next/link";
import type { MenuCategoryDefinition } from "@/data/menuCategories";

interface MenuCategoryNavProps {
  categories: MenuCategoryDefinition[];
}

export default function MenuCategoryNav({ categories }: MenuCategoryNavProps) {
  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-[72px] z-30 border-y border-border bg-white/95 backdrop-blur"
    >
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-3 md:px-8">
        <div className="flex min-w-max items-center gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/menu/${category.slug}`}
              className="rounded-full border border-border bg-bg-soft px-4 py-2 font-inter text-xs font-bold uppercase tracking-[0.14em] text-text-mid transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
