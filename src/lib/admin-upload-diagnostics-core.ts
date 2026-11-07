import { cloudinaryHttpCode } from "./cloudinary-upload-core.ts";

export type UploadDiagnosticStage =
  | "authentication"
  | "validation"
  | "begin_image_asset"
  | "existing_row_lookup"
  | "cloudinary_find_remote"
  | "cloudinary_upload"
  | "integrity_verification"
  | "supabase_finalization"
  | "preview_resolution";

export type UploadDiagnosticStatus = "started" | "completed" | "failed";

export interface UploadDiagnosticRecord {
  event: "admin_image_upload";
  requestId: string;
  stage: UploadDiagnosticStage;
  status: UploadDiagnosticStatus;
  elapsedMs: number;
  errorClass?: string;
  errorCode?: string;
  httpStatus?: number;
}

export interface UploadDiagnostics {
  run<T>(stage: UploadDiagnosticStage, operation: () => T | Promise<T>): Promise<T>;
}

interface UploadDiagnosticsOptions {
  sink?: (record: UploadDiagnosticRecord) => void;
  now?: () => number;
}

const SAFE_ERROR_CLASSES = new Set([
  "AdminAuthenticationError",
  "AdminAuthorizationError",
  "AdminOriginError",
  "UploadValidationError",
  "ImageUploadCollisionError",
  "ImageUploadIntegrityError",
  "Error",
  "TypeError",
]);

const SAFE_APP_ERROR_CODES = new Set([
  "cloudinary_collision",
  "integrity_mismatch",
]);

function readProperty(error: unknown, key: string): unknown {
  try {
    return error && typeof error === "object"
      ? (error as Record<string, unknown>)[key]
      : undefined;
  } catch {
    return undefined;
  }
}

function safeErrorClass(error: unknown): string {
  const name = error instanceof Error ? error.name : readProperty(error, "name");
  return typeof name === "string" && SAFE_ERROR_CLASSES.has(name) ? name : "UnknownError";
}

function safeErrorCode(error: unknown): string | undefined {
  const code = readProperty(error, "code");
  if (typeof code !== "string") return undefined;
  if (SAFE_APP_ERROR_CODES.has(code)) return code;
  if (/^(?:E[A-Z0-9_]{1,31}|PGRST\d{3}|[0-9A-Z]{5})$/.test(code)) return code;
  return undefined;
}

function safeHttpStatus(error: unknown): number | undefined {
  let cloudinaryStatus = 0;
  try {
    cloudinaryStatus = cloudinaryHttpCode(error);
  } catch {
    // A diagnostic must never alter request behavior because an error object is unusual.
  }
  const candidate = cloudinaryStatus || Number(
    readProperty(error, "status") ?? readProperty(error, "statusCode") ?? 0,
  );
  return Number.isInteger(candidate) && candidate >= 100 && candidate <= 599
    ? candidate
    : undefined;
}

function defaultSink(record: UploadDiagnosticRecord): void {
  const serialized = JSON.stringify(record);
  if (record.status === "failed") {
    console.error(serialized);
  } else {
    console.info(serialized);
  }
}

export function createUploadDiagnostics(
  requestId: string,
  options: UploadDiagnosticsOptions = {},
): UploadDiagnostics {
  const sink = options.sink ?? defaultSink;
  const now = options.now ?? Date.now;

  function emit(record: UploadDiagnosticRecord): void {
    try {
      sink(record);
    } catch {
      // Diagnostics are deliberately best-effort and cannot change upload behavior.
    }
  }

  return {
    async run<T>(stage: UploadDiagnosticStage, operation: () => T | Promise<T>): Promise<T> {
      const startedAt = now();
      emit({
        event: "admin_image_upload",
        requestId,
        stage,
        status: "started",
        elapsedMs: 0,
      });
      try {
        const result = await operation();
        emit({
          event: "admin_image_upload",
          requestId,
          stage,
          status: "completed",
          elapsedMs: Math.max(0, Math.round(now() - startedAt)),
        });
        return result;
      } catch (error) {
        const errorCode = safeErrorCode(error);
        const httpStatus = safeHttpStatus(error);
        emit({
          event: "admin_image_upload",
          requestId,
          stage,
          status: "failed",
          elapsedMs: Math.max(0, Math.round(now() - startedAt)),
          errorClass: safeErrorClass(error),
          ...(errorCode ? { errorCode } : {}),
          ...(httpStatus ? { httpStatus } : {}),
        });
        throw error;
      }
    },
  };
}
