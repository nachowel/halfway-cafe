import "server-only";

import mappingJson from "../data/cloudinary-assets.v1.json";
import { createCloudinaryResolvedImage, createPublicImageResolver } from "./public-image-core";
import { parseCloudinaryReference } from "./admin-image-core";
import { createServerComponentClient } from "./supabase-server";
import { findReadyImageAsset } from "./image-asset-registry.server";
import type {
  CloudinaryAssetMapping,
  PublicImageRole,
  ResolvedPublicImage,
} from "../types/public-image";

const APPROVED_MANIFEST_SHA256 =
  "ea214f628cdf683990015e595a4946af0333c6a7acc7a8ba8512e79bb94a8cb7";
const mapping = mappingJson as CloudinaryAssetMapping;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? "";

if (mapping.manifestSha256 !== APPROVED_MANIFEST_SHA256 || mapping.assets.length !== 101) {
  throw new Error("Cloudinary application mapping is not the approved 101-asset manifest");
}

const resolver = createPublicImageResolver({
  mapping,
  cloudName,
  apiSecret,
});

export async function resolvePublicImage(
  source: string | null | undefined,
  role: PublicImageRole,
): Promise<ResolvedPublicImage | null> {
  const resolved = resolver(source, role);
  const publicId = parseCloudinaryReference(source);
  if (!publicId || resolved?.provider === "cloudinary") return resolved;

  const supabase = await createServerComponentClient();
  if (!supabase) return null;
  const asset = await findReadyImageAsset(supabase, publicId);
  if (!asset) return null;
  return createCloudinaryResolvedImage(
    {
      objectPath: source?.trim() ?? publicId,
      publicId: asset.public_id,
      version: asset.version ?? 0,
      format: asset.format,
      width: asset.width,
      height: asset.height,
    },
    role,
    cloudName,
    apiSecret,
  );
}

export async function resolveRequiredPublicImage(source: string, role: PublicImageRole) {
  const image = await resolvePublicImage(source, role);
  if (!image) throw new Error(`Unable to resolve required public image: ${source}`);
  return image;
}
