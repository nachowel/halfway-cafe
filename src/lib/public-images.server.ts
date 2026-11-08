import "server-only";

import mappingJson from "../data/cloudinary-assets.v1.json";
import { createPublicImageResolver } from "./public-image-core";
import type {
  CloudinaryAssetMapping,
  PublicImageRole,
  ResolvedPublicImage,
} from "../types/public-image";

const APPROVED_MANIFEST_SHA256 =
  "ea214f628cdf683990015e595a4946af0333c6a7acc7a8ba8512e79bb94a8cb7";
const mapping = mappingJson as CloudinaryAssetMapping;

if (mapping.manifestSha256 !== APPROVED_MANIFEST_SHA256 || mapping.assets.length !== 101) {
  throw new Error("Cloudinary application mapping is not the approved 101-asset manifest");
}

const resolver = createPublicImageResolver({
  mapping,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "",
  apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() ?? "",
});

export function resolvePublicImage(
  source: string | null | undefined,
  role: PublicImageRole,
): ResolvedPublicImage | null {
  return resolver(source, role);
}

export function resolveRequiredPublicImage(source: string, role: PublicImageRole) {
  const image = resolvePublicImage(source, role);
  if (!image) throw new Error(`Unable to resolve required public image: ${source}`);
  return image;
}

