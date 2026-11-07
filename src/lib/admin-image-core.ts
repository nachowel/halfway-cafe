export const CLOUDINARY_REFERENCE_PREFIX = "cloudinary/";
export const HALFWAY_CLOUDINARY_NAMESPACE = "halfway-cafe/";
export const HALFWAY_ADMIN_UPLOAD_NAMESPACE = "halfway-cafe/admin/";

const PUBLIC_ID_PATTERN = /^halfway-cafe\/[a-z0-9][a-z0-9/_-]*$/;

export type AdminImageIntent =
  | { kind: "unchanged" }
  | { kind: "replace"; reference: string }
  | { kind: "remove" };

export function parseCloudinaryReference(value: string | null | undefined): string | null {
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

export function createCloudinaryReference(publicId: string): string {
  const reference = `${CLOUDINARY_REFERENCE_PREFIX}${publicId}`;
  if (!parseCloudinaryReference(reference)) {
    throw new Error("Cloudinary public ID must be inside the halfway-cafe namespace");
  }
  return reference;
}

export function sanitizeAssetFilename(filename: string): string {
  const basename = filename.replace(/\\/g, "/").split("/").pop() ?? "";
  const withoutExtension = basename.replace(/\.[^.]*$/, "");
  const slug = withoutExtension
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");

  return slug || "image";
}

export function applyImageIntent<T extends Record<string, unknown>>(
  patch: T,
  field: string,
  intent: AdminImageIntent,
): T & Record<string, unknown> {
  if (intent.kind === "unchanged") return patch;
  if (intent.kind === "remove") return { ...patch, [field]: null };
  if (!parseCloudinaryReference(intent.reference)) {
    throw new Error("Replacement image must be a Halfway Cafe Cloudinary asset reference");
  }
  return { ...patch, [field]: intent.reference };
}
