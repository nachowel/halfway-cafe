import "server-only";

import { resolvePublicImage } from "./public-images.server";
import type { PublicImageRole, ResolvedPublicImage } from "@/types/public-image";
import type { SafeAdminImage } from "@/types/admin-image";

function publicPreview(image: ResolvedPublicImage): ResolvedPublicImage {
  return {
    src: image.src,
    srcSet: image.srcSet,
    width: image.width,
    height: image.height,
    widths: image.widths,
    provider: image.provider,
  };
}

export async function describeAdminImage(
  source: string | null | undefined,
  role: PublicImageRole = "card",
): Promise<SafeAdminImage> {
  if (!source?.trim()) {
    return { hasImage: false, label: "No image", provider: null, preview: null };
  }
  const resolved = await resolvePublicImage(source, role);
  if (!resolved) {
    return { hasImage: true, label: "Image unavailable", provider: null, preview: null };
  }
  return {
    hasImage: true,
    label: `${resolved.provider[0].toUpperCase()}${resolved.provider.slice(1)} image`,
    provider: resolved.provider,
    preview: publicPreview(resolved),
  };
}
