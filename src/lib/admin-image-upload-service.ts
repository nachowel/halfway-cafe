import type { NormalizedImage } from "./admin-image-processing.server.ts";
import {
  HALFWAY_ADMIN_UPLOAD_NAMESPACE,
  createCloudinaryReference,
  sanitizeAssetFilename,
} from "./admin-image-core.ts";
import type {
  UploadDiagnostics,
  UploadDiagnosticStage,
} from "./admin-upload-diagnostics-core.ts";

export type ImageAssetStatus = "pending" | "ready" | "failed";

export interface ImageAssetRegistryRow {
  id: string;
  public_id: string;
  asset_id: string | null;
  version: number | null;
  format: "jpeg" | "png" | "webp";
  width: number;
  height: number;
  byte_size: number;
  source_sha256: string;
  original_filename: string;
  mime_type: string;
  status: ImageAssetStatus;
}

export interface BeginImageAssetInput {
  publicId: string;
  format: NormalizedImage["format"];
  width: number;
  height: number;
  byteSize: number;
  sourceSha256: string;
  originalFilename: string;
  mimeType: string;
  idempotencyKey: string;
}

export interface RemoteImageAsset {
  publicId: string;
  assetId: string;
  version: number;
  format: string;
  width: number;
  height: number;
  bytes: number;
  existing?: boolean;
}

export interface UploadedImageResult {
  reference: string;
  publicId: string;
  assetId: string;
  version: number;
  format: ImageAssetRegistryRow["format"];
  width: number;
  height: number;
  byteSize: number;
}

export class ImageUploadIntegrityError extends Error {
  readonly code = "integrity_mismatch";

  constructor(message: string) {
    super(message);
    this.name = "ImageUploadIntegrityError";
  }
}

export class ImageUploadCollisionError extends Error {
  readonly code = "cloudinary_collision";

  constructor() {
    super("Cloudinary reported an existing asset for a newly generated public ID");
    this.name = "ImageUploadCollisionError";
  }
}

export interface ImageUploadDependencies {
  randomUUID(): string;
  begin(input: BeginImageAssetInput): Promise<ImageAssetRegistryRow>;
  findRemote(publicId: string): Promise<RemoteImageAsset | null>;
  upload(buffer: Buffer, publicId: string, filename: string): Promise<RemoteImageAsset>;
  finalize(id: string, remote: RemoteImageAsset): Promise<ImageAssetRegistryRow>;
  fail(id: string, errorCode: string): Promise<void>;
  diagnostics?: UploadDiagnostics;
}

const PASSTHROUGH_DIAGNOSTICS: UploadDiagnostics = {
  async run<T>(_stage: UploadDiagnosticStage, operation: () => T | Promise<T>): Promise<T> {
    return await operation();
  },
};

function normalizedRemoteFormat(format: string) {
  return format.toLowerCase() === "jpg" ? "jpeg" : format.toLowerCase();
}

function assertRemoteIntegrity(
  remote: RemoteImageAsset,
  expectedPublicId: string,
  image: NormalizedImage,
): void {
  if (remote.existing) throw new ImageUploadCollisionError();
  if (
    remote.publicId !== expectedPublicId ||
    !remote.assetId ||
    !Number.isInteger(remote.version) ||
    remote.version < 1 ||
    normalizedRemoteFormat(remote.format) !== image.format ||
    remote.width !== image.width ||
    remote.height !== image.height ||
    remote.bytes !== image.byteSize
  ) {
    throw new ImageUploadIntegrityError("Cloudinary response metadata did not match the verified upload");
  }
}

function resultFromReadyRow(row: ImageAssetRegistryRow): UploadedImageResult {
  if (row.status !== "ready" || !row.asset_id || !row.version) {
    throw new ImageUploadIntegrityError("The registry returned incomplete ready-asset metadata");
  }
  return {
    reference: createCloudinaryReference(row.public_id),
    publicId: row.public_id,
    assetId: row.asset_id,
    version: row.version,
    format: row.format,
    width: row.width,
    height: row.height,
    byteSize: row.byte_size,
  };
}

export async function executeImageUpload(
  input: { image: NormalizedImage; idempotencyKey: string },
  dependencies: ImageUploadDependencies,
): Promise<UploadedImageResult> {
  const diagnostics = dependencies.diagnostics ?? PASSTHROUGH_DIAGNOSTICS;
  const slug = sanitizeAssetFilename(input.image.safeFilename);
  const proposedPublicId = `${HALFWAY_ADMIN_UPLOAD_NAMESPACE}${slug}--${dependencies.randomUUID()}`;
  const row = await diagnostics.run("begin_image_asset", () => dependencies.begin({
      publicId: proposedPublicId,
      format: input.image.format,
      width: input.image.width,
      height: input.image.height,
      byteSize: input.image.byteSize,
      sourceSha256: input.image.sha256,
      originalFilename: input.image.safeFilename,
      mimeType: input.image.mime,
      idempotencyKey: input.idempotencyKey,
    }));

  const existing = await diagnostics.run("existing_row_lookup", () => {
    if (row.status === "ready") return resultFromReadyRow(row);
    if (row.status !== "pending") {
      throw new Error("A failed upload must be retried with a new idempotency key");
    }
    return null;
  });
  if (existing) return existing;

  try {
    const reconciled = await diagnostics.run(
      "cloudinary_find_remote",
      () => dependencies.findRemote(row.public_id),
    );
    const remote = reconciled ?? await diagnostics.run(
      "cloudinary_upload",
      () => dependencies.upload(input.image.buffer, row.public_id, input.image.safeFilename),
    );
    await diagnostics.run(
      "integrity_verification",
      () => assertRemoteIntegrity(remote, row.public_id, input.image),
    );
    return await diagnostics.run("supabase_finalization", async () => {
      const ready = await dependencies.finalize(
        row.id,
        { ...remote, format: input.image.format },
      );
      return resultFromReadyRow(ready);
    });
  } catch (error) {
    const code = error instanceof ImageUploadIntegrityError
      ? error.code
      : error instanceof ImageUploadCollisionError
        ? error.code
        : "cloudinary_upload_failed";
    // Unknown network/auth/finalization failures remain pending so the same
    // idempotency key can reconcile an upload that may already have succeeded.
    if (code !== "cloudinary_upload_failed") {
      await dependencies.fail(row.id, code).catch(() => undefined);
    }
    throw error;
  }
}
