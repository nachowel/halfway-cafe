"use server";

import {
  parseAdminCloudinaryReference,
  type AdminMenuImagePreview,
} from "@/lib/admin-menu-image-core";
import { resolveAdminLogicalImagePreview } from "@/lib/admin-menu-image-preview.server";
import { createServerComponentClient } from "@/lib/supabase-server";

export async function resolveAdminMenuImagePreviews(
  sources: string[],
  role: "thumbnail" | "card",
): Promise<Record<string, AdminMenuImagePreview | null>> {
  if (
    !Array.isArray(sources) ||
    sources.length > 100 ||
    sources.some((source) => typeof source !== "string")
  ) {
    throw new Error("Invalid image preview request");
  }
  if (role !== "thumbnail" && role !== "card") {
    throw new Error("Invalid image preview role");
  }

  const supabase = await createServerComponentClient();
  if (!supabase) throw new Error("Authentication required");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Authentication required");

  const uniqueSources = Array.from(new Set(sources.map((source) => source.trim())));
  const previews = await Promise.all(
    uniqueSources.map(async (source) => {
      if (!parseAdminCloudinaryReference(source)) {
        return [source, null] as const;
      }
      const image = await resolveAdminLogicalImagePreview(source, role);
      return [
        source,
        image
          ? { src: image.src, width: image.width, height: image.height }
          : null,
      ] as const;
    }),
  );

  return Object.fromEntries(previews);
}
