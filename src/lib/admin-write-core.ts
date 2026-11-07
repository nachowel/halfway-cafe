import { applyImageIntent, type AdminImageIntent } from "./admin-image-core.ts";

export function buildGalleryImageValues(
  rows: { id: string; imageIntent: AdminImageIntent }[],
  currentById: Map<string, string>,
) {
  return rows.map((row) => {
    if (row.imageIntent.kind === "unchanged") {
      const current = currentById.get(row.id);
      if (!current) throw new Error("A new gallery row requires an image");
      return { id: row.id, url: current };
    }
    const patch = applyImageIntent({}, "url", row.imageIntent);
    if (patch.url === null) throw new Error("Gallery rows cannot be saved without an image");
    return { id: row.id, url: String(patch.url) };
  });
}

export function buildImageSettingChanges(intents: Record<string, AdminImageIntent>) {
  return Object.entries(intents).flatMap(([key, intent]) => {
    const patch = applyImageIntent({}, "value", intent);
    return "value" in patch ? [{ key, value: patch.value as string | null }] : [];
  });
}
