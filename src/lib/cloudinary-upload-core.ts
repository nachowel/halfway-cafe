export function buildCloudinaryUploadOptions(publicId: string, filename: string) {
  if (!publicId.startsWith("halfway-cafe/admin/") || publicId.includes("..")) {
    throw new Error("Refusing upload outside the Halfway Cafe admin namespace");
  }
  return {
    resource_type: "image" as const,
    type: "upload" as const,
    public_id: publicId,
    overwrite: false,
    invalidate: false,
    unique_filename: false,
    use_filename: false,
    filename_override: filename,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  };
}

export function cloudinaryHttpCode(error: unknown): number {
  if (!error || typeof error !== "object") return 0;
  const direct = Number((error as { http_code?: unknown }).http_code ?? 0);
  if (direct) return direct;
  const nested = (error as { error?: unknown }).error;
  if (!nested || typeof nested !== "object") return 0;
  return Number((nested as { http_code?: unknown }).http_code ?? 0);
}
