import MobileCategoryPage, {
  type CategoryRow,
  type CountRow,
  type MenuItemRow,
} from "./MobileCategoryPage";
import { getCategories, getMenuItems } from "@/lib/queries";
import { resolvePublicImage } from "@/lib/public-images.server";
import { withoutImageSource } from "@/lib/public-image-data";

export default async function MobileCategoryPageServer({ categorySlug }: { categorySlug: string }) {
  const [categories, allItems] = await Promise.all([getCategories(), getMenuItems()]);
  const items = (allItems as MenuItemRow[])
    .filter((item) => item.category === categorySlug)
    .map((item) => {
      return {
        ...withoutImageSource(item),
        image: resolvePublicImage(item.image_url, "content"),
      };
    });
  const countRows = (allItems as MenuItemRow[]).map((item) => ({
    id: item.id,
    category: item.category,
  })) satisfies CountRow[];
  return (
    <MobileCategoryPage
      categorySlug={categorySlug}
      categories={(categories as CategoryRow[]).map(withoutImageSource)}
      items={items}
      countRows={countRows}
    />
  );
}
