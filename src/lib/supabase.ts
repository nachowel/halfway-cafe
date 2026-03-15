/* Supabase browser client — safe to import in 'use client' components */

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv, warnMissingSupabaseEnv } from "./supabase-config";

export function createClientComponentClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function createOptionalClientComponentClient(context: string) {
  const env = getSupabasePublicEnv();

  if (!env) {
    warnMissingSupabaseEnv(context);
    return null;
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
