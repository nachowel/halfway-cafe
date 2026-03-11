/* Supabase browser client — safe to import in 'use client' components */

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function createClientComponentClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
