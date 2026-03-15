/* Supabase server client — only import in Server Components / Route Handlers */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv, warnMissingSupabaseEnv } from "./supabase-config";

export async function createServerComponentClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    warnMissingSupabaseEnv("Server data fetching");
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll can fail in Server Components (read-only).
          // Middleware handles session refresh.
        }
      },
    },
  });
}
