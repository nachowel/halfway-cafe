import MobileMenuPage, {
  type CategoryRow,
  type MobileMenuData,
  type OpeningHoursRow,
} from "./MobileMenuPage";
import { getCategories, getMenuItems, getOpeningHours } from "@/lib/queries";
import { resolvePublicImage } from "@/lib/public-images.server";
import { withoutImageSource } from "@/lib/public-image-data";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function MobileMenuPageServer() {
  const [categories, items, openingHours] = await Promise.all([
    getCategories(), getMenuItems(), getOpeningHours(),
  ]);
  const itemCounts = items.reduce<Record<string, number>>((counts, item) => {
    const slug = typeof item.category === "string" ? item.category.trim() : "";
    if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
    return counts;
  }, {});
  const data: MobileMenuData = {
    categories: (categories as CategoryRow[]).map((category) => {
      return {
        ...withoutImageSource(category),
        image: resolvePublicImage(category.image_url, "thumbnail"),
      };
    }),
    openingHours: openingHours as OpeningHoursRow[],
    itemCounts,
    todayIndex: dayNames.indexOf(
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        timeZone: "Europe/London",
      }).format(new Date()),
    ),
  };
  return <MobileMenuPage data={data} />;
}
