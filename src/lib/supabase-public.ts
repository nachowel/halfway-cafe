/* Supabase anonymous server client — for public, cookie-free reads.
 *
 * Use this for anything a logged-out visitor can see (menu, opening hours,
 * gallery, site settings, public image registry). It never reads cookies and
 * never attaches a session, so a public render can never run with an admin's
 * credentials and never opts a route into dynamic rendering.
 *
 * Authenticated reads (admin dashboard, admin server actions) must keep using
 * `createServerComponentClient` from `./supabase-server`.
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, warnMissingSupabaseEnv } from "./supabase-config";

export function createPublicServerClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    warnMissingSupabaseEnv("Public data fetching");
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
