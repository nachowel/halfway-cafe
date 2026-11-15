/* Supabase anonymous server client — for public, cookie-free reads.
 *
 * Use the default client for cacheable public pages (menu, opening hours,
 * gallery, site settings, public image registry). The live client explicitly
 * opts its fetches out of Next's Data Cache for dynamic menu and QR routes.
 * Neither client reads cookies or attaches a session, so public renders never
 * run with an admin's credentials.
 *
 * Authenticated reads (admin dashboard, admin server actions) must keep using
 * `createServerComponentClient` from `./supabase-server`.
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, warnMissingSupabaseEnv } from "./supabase-config";
import { createLiveDataFetch } from "./live-public-fetch";

function createPublicServerClientWithFetch(fetchImplementation?: typeof fetch) {
  const env = getSupabasePublicEnv();

  if (!env) {
    warnMissingSupabaseEnv("Public data fetching");
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...(fetchImplementation
      ? { global: { fetch: fetchImplementation } }
      : {}),
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createPublicServerClient() {
  return createPublicServerClientWithFetch();
}

export function createLivePublicServerClient() {
  return createPublicServerClientWithFetch(createLiveDataFetch(fetch));
}
