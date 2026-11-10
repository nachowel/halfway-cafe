const CLOUDINARY_REFERENCE_PREFIX = "cloudinary/";
const PUBLIC_ID_PATTERN = /^halfway-cafe\/[a-z0-9][a-z0-9/_-]*$/;

export type AdminImageIntent =
  | { kind: "unchanged" }
  | { kind: "replace"; reference: string }
  | { kind: "remove" };

export interface StaticAdminImageAsset {
  publicId: string;
  objectPath: string;
}

export interface AdminMenuImagePreview {
  src: string;
  width?: number;
  height?: number;
}

export function parseAdminCloudinaryReference(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized.startsWith(CLOUDINARY_REFERENCE_PREFIX)) return null;

  const publicId = normalized.slice(CLOUDINARY_REFERENCE_PREFIX.length);
  if (
    !PUBLIC_ID_PATTERN.test(publicId) ||
    publicId.includes("..") ||
    publicId.includes("//") ||
    publicId.endsWith("/")
  ) {
    return null;
  }

  return publicId;
}

export function applyAdminImageIntent<T extends Record<string, unknown>>(
  payload: T,
  field: string,
  intent: AdminImageIntent,
): T & Record<string, unknown> {
  if (intent.kind === "unchanged") return payload;
  if (intent.kind === "remove") return { ...payload, [field]: null };
  return { ...payload, [field]: intent.reference };
}

export async function resolveAdminLogicalImagePreviewCore<TPreview>({
  source,
  staticAssets,
  resolveStatic,
  resolveRegistered,
}: {
  source: string;
  staticAssets: StaticAdminImageAsset[];
  resolveStatic: (asset: StaticAdminImageAsset) => Promise<TPreview | null>;
  resolveRegistered: (reference: string) => Promise<TPreview | null>;
}): Promise<TPreview | null> {
  const publicId = parseAdminCloudinaryReference(source);
  if (!publicId) return null;

  try {
    const mapped = staticAssets.find((asset) => asset.publicId === publicId);
    return mapped ? await resolveStatic(mapped) : await resolveRegistered(source.trim());
  } catch {
    return null;
  }
}
