import { NextResponse } from "next/server";

import {
  AdminAuthenticationError,
  AdminAuthorizationError,
  requireHalfwayAdmin,
} from "@/lib/admin-auth.server";
import { listAdminImagePickerItems } from "@/lib/admin-image-picker.server";
import { consumeAdminImageRateLimit } from "@/lib/image-asset-registry.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { supabase } = await requireHalfwayAdmin();
    await consumeAdminImageRateLimit(supabase, "picker");
    const assets = await listAdminImagePickerItems(supabase);
    return NextResponse.json({ assets }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof AdminAuthenticationError) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "";
    if (message.includes("rate limit")) {
      return NextResponse.json({ error: "Picker rate limit exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Unable to load images" }, { status: 500 });
  }
}
