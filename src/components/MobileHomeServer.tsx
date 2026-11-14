import MobileHome, {
  type CategoryRow,
  type HomeData,
  type MenuItemRow,
  type OpeningHoursRow,
  type PlatformCard,
  type SocialLink,
} from "./MobileHome";
import {
  getCategories,
  getMenuItems,
  getOpeningHours,
  getSiteSettingsByKeys,
} from "@/lib/queries";
import { getMobileHeroImage } from "@/lib/site-settings";
import { getLondonWeekdayIndex } from "@/lib/london-time";
import { resolvePublicImage, resolveRequiredPublicImage } from "@/lib/public-images.server";
import { withoutImageSource } from "@/lib/public-image-data";

const settingKeys = [
  "hero_image_web", "hero_image_mobile",
  "delivery_ubereats", "delivery_ubereats_logo",
  "delivery_justeat", "delivery_justeat_logo",
  "delivery_deliveroo", "delivery_deliveroo_logo",
  "social_instagram", "social_facebook", "social_tiktok",
];

function siteUrl(settings: Record<string, string>, key: string) {
  const value = settings[key]?.trim() ?? "";
  return /^https?:\/\//i.test(value) ? value : "";
}

function popularDishes(items: MenuItemRow[]) {
  const rank = (item: MenuItemRow) => typeof item.sort_order === "number"
    ? item.sort_order
    : Number.MAX_SAFE_INTEGER;
  const featured = items.filter((item) => item.featured === true || item.is_featured === true);
  return (featured.length > 0 ? featured : items)
    .toSorted((a, b) => rank(a) - rank(b))
    .slice(0, featured.length > 0 ? featured.length : 4);
}

export default async function MobileHomeServer() {
  const [hours, categories, menuItems, settings] = await Promise.all([
    getOpeningHours(), getCategories(), getMenuItems(), getSiteSettingsByKeys(settingKeys),
  ]);
  const dishes = popularDishes(menuItems as MenuItemRow[]).map((item) => {
    return { ...withoutImageSource(item), image: resolvePublicImage(item.image_url, "thumbnail") };
  });
  const resolvedCategories = (categories as CategoryRow[]).map((category) => {
    return {
      ...withoutImageSource(category),
      image: resolvePublicImage(category.image_url, "thumbnail"),
    };
  });
  const data: HomeData = {
    heroImage: resolvePublicImage(getMobileHeroImage(settings), "hero"),
    openingHours: hours as OpeningHoursRow[],
    dishes,
    categories: resolvedCategories,
  };
  const platforms = [
    ["Uber Eats", "delivery_ubereats", "delivery_ubereats_logo"],
    ["Just Eat", "delivery_justeat", "delivery_justeat_logo"],
    ["Deliveroo", "delivery_deliveroo", "delivery_deliveroo_logo"],
  ].flatMap(([name, urlKey, logoKey]) => {
    const url = siteUrl(settings, urlKey);
    const logo = resolvePublicImage(siteUrl(settings, logoKey), "logo");
    return url && logo ? [{ name, url, logo } satisfies PlatformCard] : [];
  });
  const socialLinks = [
    ["Instagram", "social_instagram"],
    ["Facebook", "social_facebook"],
    ["TikTok", "social_tiktok"],
  ].flatMap(([name, key]) => {
    const url = siteUrl(settings, key);
    return url ? [{ name, url } satisfies SocialLink] : [];
  });

  return (
    <MobileHome
      data={data}
      deliveryPlatforms={platforms}
      socialLinks={socialLinks}
      logoImage={resolveRequiredPublicImage("Hero/icon-logo.png", "logo")}
      initialWeekdayIndex={getLondonWeekdayIndex()}
    />
  );
}
