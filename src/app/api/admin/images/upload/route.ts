import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  AdminAuthenticationError,
  AdminAuthorizationError,
  requireHalfwayAdmin,
} from "@/lib/admin-auth.server";
import { validateAndNormalizeImage } from "@/lib/admin-image-processing.server";
import { executeImageUpload } from "@/lib/admin-image-upload-service";
import { assertSameOriginMutation, AdminOriginError } from "@/lib/admin-origin-core";
import {
  UploadValidationError,
  assertAllowedClaimedMime,
  readBodyWithLimit,
} from "@/lib/admin-upload-core";
import { createUploadDiagnostics } from "@/lib/admin-upload-diagnostics-core";
import { findHalfwayImage, uploadHalfwayImage } from "@/lib/cloudinary-admin.server";
import {
  beginImageAsset,
  failImageAsset,
  finalizeImageAsset,
} from "@/lib/image-asset-registry.server";
import { resolvePublicImage } from "@/lib/public-images.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function responseForError(error: unknown) {
  if (error instanceof AdminAuthenticationError) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (error instanceof AdminAuthorizationError || error instanceof AdminOriginError) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (error instanceof UploadValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
  const message = error instanceof Error ? error.message : "";
  if (message.includes("rate limit")) return NextResponse.json({ error: "Upload rate limit exceeded" }, { status: 429 });
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  if (code === "cloudinary_collision" || code === "integrity_mismatch" || message.includes("metadata")) {
    return NextResponse.json({ error: "Upload integrity verification failed" }, { status: 409 });
  }
  return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
}

export async function POST(request: Request) {
  const diagnostics = createUploadDiagnostics(randomUUID());
  try {
    const { supabase } = await diagnostics.run("authentication", async () => {
      assertSameOriginMutation(request);
      return await requireHalfwayAdmin();
    });
    const { image, idempotencyKey } = await diagnostics.run("validation", async () => {
      const mime = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
      assertAllowedClaimedMime(mime);
      let originalFilename = "";
      try {
        originalFilename = decodeURIComponent(request.headers.get("x-file-name")?.trim() ?? "");
      } catch {
        throw new UploadValidationError("A safe filename is required");
      }
      if (!originalFilename || originalFilename.length > 255) {
        throw new UploadValidationError("A safe filename is required");
      }
      const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
      if (!UUID_PATTERN.test(idempotencyKey)) {
        throw new UploadValidationError("A valid idempotency key is required");
      }

      const source = await readBodyWithLimit(request);
      const image = await validateAndNormalizeImage(source, mime, originalFilename);
      return { image, idempotencyKey };
    });
    const result = await executeImageUpload(
      { image, idempotencyKey },
      {
        randomUUID,
        begin: (input) => beginImageAsset(supabase, input),
        findRemote: findHalfwayImage,
        upload: uploadHalfwayImage,
        finalize: (id, remote) => finalizeImageAsset(supabase, id, remote),
        fail: (id, code) => failImageAsset(supabase, id, code),
        diagnostics,
      },
    );

    const preview = await diagnostics.run(
      "preview_resolution",
      () => resolvePublicImage(result.reference, "card"),
    );
    return NextResponse.json({ asset: { ...result, preview } }, { status: 201 });
  } catch (error) {
    return responseForError(error);
  }
}
