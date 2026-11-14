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

const REQUIRED_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function getMissingSupabasePublicEnvKeys(
  env: Record<string, string | undefined>
): string[] {
  return REQUIRED_PUBLIC_ENV_KEYS.filter((key) => !env[key]?.trim());
}

/**
 * Refuse to produce a production build without the public Supabase env.
 *
 * `NEXT_PUBLIC_*` values are inlined at build time, so a build that starts
 * without them can never recover at runtime: every ISR revalidation would
 * re-render the same fallback menu, gallery and footer. Failing the build is
 * safer than publishing a permanently incomplete static snapshot.
 */
export function assertSupabasePublicEnvForProductionBuild(
  env: Record<string, string | undefined> = process.env,
  phase: string | undefined = process.env.NEXT_PHASE
): void {
  if (phase !== "phase-production-build") {
    return;
  }

  const missing = getMissingSupabasePublicEnvKeys(env);

  if (missing.length > 0) {
    throw new Error(
      `[build] Missing required public Supabase environment variable(s): ${missing.join(", ")}. ` +
        "Refusing to build a production bundle that would cache permanent fallback pages."
    );
  }
}

assertSupabasePublicEnvForProductionBuild();
