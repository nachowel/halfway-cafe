/* Middleware — protect /admin routes (except /admin/login) */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv, warnMissingSupabaseEnv } from "@/lib/supabase-config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login is public
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const env = getSupabasePublicEnv();

  if (!env) {
    warnMissingSupabaseEnv("Admin middleware");
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Build a Supabase server client that reads cookies from the request
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session (important — keeps the session alive)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session → redirect to login
  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
