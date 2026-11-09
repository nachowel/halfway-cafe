import MobileCategoryPage, {
  type CategoryRow,
  type CountRow,
  type MenuItemRow,
} from "./MobileCategoryPage";
import { resolveMenuItemForDisplay } from "@/lib/public-menu-images.server";
import { getCategories, getMenuItemsByCategory } from "@/lib/queries";

export default async function MobileCategoryPageServer({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const [categoryRows, itemRows] = await Promise.all([
    getCategories(),
    getMenuItemsByCategory(categorySlug),
  ]);
  const categories: CategoryRow[] = categoryRows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
  }));
  const items = await Promise.all(
    itemRows.map((row) => {
      const item: MenuItemRow = {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        price_roll: row.price_roll,
        price_sandwich: row.price_sandwich,
        price_baguette: row.price_baguette,
        image_url: row.image_url,
        category: row.category,
        active: row.active,
        sort_order: row.sort_order,
      };
      return resolveMenuItemForDisplay(item, "image_url", "content");
    }),
  );
  const countRows: CountRow[] = itemRows.map((row) => ({
    id: row.id,
    category: row.category,
  }));

  return (
    <MobileCategoryPage
      categorySlug={categorySlug}
      categories={categories}
      items={items}
      countRows={countRows}
    />
  );
}
