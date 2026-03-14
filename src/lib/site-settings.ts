export interface SiteSettingRow {
  key: string;
  value: string | null;
}

export function toSiteSettingsMap(rows: SiteSettingRow[]): Record<string, string> {
  return Object.fromEntries(
    rows.map((row) => [row.key, typeof row.value === "string" ? row.value : ""])
  );
}

export function getSiteSettingValue(
  settings: Record<string, string>,
  key: string
): string | null {
  const value = settings[key]?.trim();
  return value ? value : null;
}

export function getDesktopHeroImage(settings: Record<string, string>): string | null {
  return getSiteSettingValue(settings, "hero_image_web");
}

export function getMobileHeroImage(settings: Record<string, string>): string | null {
  return (
    getSiteSettingValue(settings, "hero_image_mobile") ??
    getSiteSettingValue(settings, "hero_image_web")
  );
}
