import { NextResponse } from "next/server";

import {
  AdminAuthenticationError,
  AdminAuthorizationError,
  requireHalfwayAdmin,
} from "@/lib/admin-auth.server";
import { parseCloudinaryReference } from "@/lib/admin-image-core";
import { assertSameOriginMutation, AdminOriginError } from "@/lib/admin-origin-core";
import { readBodyWithLimit, UploadValidationError } from "@/lib/admin-upload-core";
import { findHalfwayImage } from "@/lib/cloudinary-admin.server";
import {
  consumeAdminImageRateLimit,
  failImageAsset,
  finalizeImageAsset,
  findPendingImageAsset,
} from "@/lib/image-asset-registry.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request);
    const { supabase } = await requireHalfwayAdmin();
    await consumeAdminImageRateLimit(supabase, "reconcile");
    const body = JSON.parse((await readBodyWithLimit(request, 4_096)).toString("utf8")) as {
      reference?: unknown;
    };
    const publicId = typeof body.reference === "string"
      ? parseCloudinaryReference(body.reference)
      : null;
    if (!publicId?.startsWith("halfway-cafe/admin/")) {
      throw new UploadValidationError("A pending Halfway Cafe admin asset reference is required");
    }
    const row = await findPendingImageAsset(supabase, publicId);
    if (!row) return NextResponse.json({ error: "Pending asset not found" }, { status: 404 });
    const remote = await findHalfwayImage(publicId);
    if (!remote) return NextResponse.json({ error: "Cloudinary asset not found" }, { status: 404 });
    const format = remote.format === "jpg" ? "jpeg" : remote.format;
    if (
      remote.publicId !== row.public_id || !remote.assetId || remote.version < 1 ||
      format !== row.format || remote.width !== row.width || remote.height !== row.height ||
      remote.bytes !== row.byte_size || remote.existing
    ) {
      await failImageAsset(supabase, row.id, "reconcile_integrity_mismatch");
      return NextResponse.json({ error: "Reconciliation integrity mismatch" }, { status: 409 });
    }
    const ready = await finalizeImageAsset(supabase, row.id, { ...remote, format });
    return NextResponse.json({
      asset: {
        reference: `cloudinary/${ready.public_id}`,
        assetId: ready.asset_id,
        version: ready.version,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthenticationError) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (error instanceof AdminAuthorizationError || error instanceof AdminOriginError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (error instanceof UploadValidationError || error instanceof SyntaxError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const message = error instanceof Error ? error.message : "";
    if (message.includes("rate limit")) return NextResponse.json({ error: "Reconciliation rate limit exceeded" }, { status: 429 });
    return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
  }
}
