const SUPABASE_STORAGE_BASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://jbatmtnlegydsjerkuml.supabase.co"
).replace(/\/+$/, "");

export function getSupabasePublicImageUrl(path: string): string {
  const normalizedPath = path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${SUPABASE_STORAGE_BASE_URL}/storage/v1/object/public/${normalizedPath}`;
}

export const BUILDERS_BREAKFAST_IMAGE_URL = getSupabasePublicImageUrl(
  "set breakfast/Buildersbreakfast.png"
);

export const BREAKFAST_HERO_IMAGE_URL = getSupabasePublicImageUrl(
  "Hero/breakfast-hero.webp"
);
