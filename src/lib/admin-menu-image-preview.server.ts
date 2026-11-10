import "server-only";

import mappingJson from "../data/cloudinary-assets.v1.json";
import { resolveAdminLogicalImagePreviewCore } from "./admin-menu-image-core";
import { resolvePublicImage } from "./public-images.server";
import { resolvePublicMenuImage } from "./public-menu-images.server";
import type {
  CloudinaryAssetMapping,
  PublicImageRole,
  ResolvedPublicImage,
} from "../types/public-image";

const mapping = mappingJson as CloudinaryAssetMapping;
const staticAssets = mapping.assets.map(({ publicId, objectPath }) => ({
  publicId,
  objectPath,
}));

export async function resolveAdminLogicalImagePreview(
  source: string,
  role: PublicImageRole,
): Promise<ResolvedPublicImage | null> {
  return resolveAdminLogicalImagePreviewCore({
    source,
    staticAssets,
    resolveStatic: async (asset) => resolvePublicImage(asset.objectPath, role),
    resolveRegistered: async (reference) => {
      const resolution = await resolvePublicMenuImage(reference, role, null);
      return resolution.kind === "cloudinary" ? resolution.image : null;
    },
  });
}
