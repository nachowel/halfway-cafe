import { createHash } from "node:crypto";

import type {
  CloudinaryRegistryAsset,
  PublicImageRole,
  PublicMenuImageDiagnostic,
  PublicMenuImageResolution,
  ResolvedPublicImage,
} from "../types/public-image.ts";

const CLOUDINARY_REFERENCE_PREFIX = "cloudinary/";
const HALFWAY_CLOUDINARY_NAMESPACE = "halfway-cafe/";
const PUBLIC_ID_PATTERN = /^halfway-cafe\/[a-z0-9][a-z0-9/_-]*$/;

export const RESPONSIVE_WIDTHS = [
  96, 192, 256, 384, 640, 828, 1080, 1376, 1600,
] as const;

const ROLE_TARGETS: Record<PublicImageRole, number> = {
  logo: 192,
  thumbnail: 384,
  card: 828,
  content: 1080,
  hero: 1600,
};

export function parseCloudinaryReference(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized.startsWith(CLOUDINARY_REFERENCE_PREFIX)) return null;

  const publicId = normalized.slice(CLOUDINARY_REFERENCE_PREFIX.length);
  if (
    !publicId.startsWith(HALFWAY_CLOUDINARY_NAMESPACE) ||
    !PUBLIC_ID_PATTERN.test(publicId) ||
    publicId.includes("..") ||
    publicId.includes("//") ||
    publicId.endsWith("/")
  ) {
    return null;
  }

  return publicId;
}

export function signCloudinaryDeliveryPath(deliveryPath: string, apiSecret: string) {
  return createHash("sha256")
    .update(`${deliveryPath}${apiSecret}`)
    .digest("base64url")
    .slice(0, 8);
}

function responsiveWidths(intrinsicWidth: number) {
  const widths = RESPONSIVE_WIDTHS.filter((width) => width <= intrinsicWidth) as number[];
  const maximumPlannedWidth = RESPONSIVE_WIDTHS[RESPONSIVE_WIDTHS.length - 1];
  if (intrinsicWidth < maximumPlannedWidth && !widths.includes(intrinsicWidth)) {
    widths.push(intrinsicWidth);
  }
  return widths;
}

function roleWidth(widths: number[], target: number) {
  return widths.reduce((selected, width) => (width <= target ? width : selected), widths[0]);
}

function isValidRegistryAsset(asset: CloudinaryRegistryAsset, publicId: string) {
  return (
    asset.public_id === publicId &&
    Number.isInteger(asset.version) &&
    asset.version > 0 &&
    ["jpeg", "jpg", "png", "webp"].includes(asset.format) &&
    Number.isInteger(asset.width) &&
    asset.width > 0 &&
    Number.isInteger(asset.height) &&
    asset.height > 0
  );
}

function createCloudinaryResolvedImage(
  asset: CloudinaryRegistryAsset,
  role: PublicImageRole,
  cloudName: string,
  apiSecret: string,
): ResolvedPublicImage {
  const widths = responsiveWidths(asset.width);
  const targetWidth = roleWidth(widths, Math.min(ROLE_TARGETS[role], asset.width));
  const makeUrl = (width: number) => {
    const deliveryPath =
      `c_limit,w_${width}/q_auto/f_webp/v${asset.version}/${asset.public_id}.${asset.format}`;
    const signature = signCloudinaryDeliveryPath(deliveryPath, apiSecret);
    return `https://res.cloudinary.com/${cloudName}/image/upload/s--${signature}--/${deliveryPath}`;
  };

  return {
    src: makeUrl(targetWidth),
    srcSet: widths.map((width) => `${makeUrl(width)} ${width}w`).join(", "),
    width: asset.width,
    height: asset.height,
    widths,
    provider: "cloudinary",
  };
}

export async function resolvePublicMenuImageCore({
  source,
  role,
  cloudName,
  apiSecret,
  lookup,
  diagnostic = () => undefined,
}: {
  source: string | null | undefined;
  role: PublicImageRole;
  cloudName: string;
  apiSecret: string;
  lookup: (publicId: string) => Promise<CloudinaryRegistryAsset | null>;
  diagnostic?: (event: PublicMenuImageDiagnostic) => void;
}): Promise<PublicMenuImageResolution> {
  const normalizedSource = source?.trim();
  if (!normalizedSource) return { kind: "none" };

  const isCloudinaryCandidate = normalizedSource.toLowerCase().startsWith(
    CLOUDINARY_REFERENCE_PREFIX,
  );
  if (!isCloudinaryCandidate) return { kind: "legacy", source: normalizedSource };

  const publicId = parseCloudinaryReference(normalizedSource);
  if (!publicId) {
    diagnostic({ stage: "invalid-reference" });
    return { kind: "cloudinary", image: null };
  }

  if (!cloudName || !apiSecret) {
    diagnostic({ stage: "configuration-missing", publicId });
    return { kind: "cloudinary", image: null };
  }

  try {
    const asset = await lookup(publicId);
    if (!asset) {
      diagnostic({ stage: "registry-missing", publicId });
      return { kind: "cloudinary", image: null };
    }
    if (!isValidRegistryAsset(asset, publicId)) {
      diagnostic({ stage: "registry-invalid", publicId });
      return { kind: "cloudinary", image: null };
    }

    return {
      kind: "cloudinary",
      image: createCloudinaryResolvedImage(asset, role, cloudName, apiSecret),
    };
  } catch {
    diagnostic({ stage: "registry-error", publicId });
    return { kind: "cloudinary", image: null };
  }
}

export async function resolvePublicMenuItemImage<
  T extends object,
  K extends keyof T,
>(
  item: T,
  sourceField: K,
  role: PublicImageRole,
  resolver: (
    source: string | null | undefined,
    role: PublicImageRole,
  ) => Promise<PublicMenuImageResolution>,
): Promise<Omit<T, K> & Partial<Pick<T, K>> & { resolvedImage?: ResolvedPublicImage | null }> {
  const sourceValue = item[sourceField];
  const source = typeof sourceValue === "string" ? sourceValue : null;
  const resolution = await resolver(source, role);

  if (resolution.kind !== "cloudinary") return item;

  const withoutLogicalReference = { ...item };
  delete withoutLogicalReference[sourceField];
  return {
    ...withoutLogicalReference,
    resolvedImage: resolution.image,
  };
}
