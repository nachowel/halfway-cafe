const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

const warnedContexts = new Set<string>();

export function hasSupabasePublicEnv() {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}

export function getSupabasePublicEnv() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export function warnMissingSupabaseEnv(context: string) {
  const runtime = typeof window === "undefined" ? "server" : "client";
  const warningKey = `${runtime}:${context}`;

  if (warnedContexts.has(warningKey)) {
    return;
  }

  warnedContexts.add(warningKey);
  console.warn(
    `[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ${context} will use fallback data until those variables are configured.`
  );
}
