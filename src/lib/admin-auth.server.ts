import "server-only";

import { createServerComponentClient } from "./supabase-server";
import { hasHalfwayAdminClaim } from "./admin-auth-core";

export class AdminAuthenticationError extends Error {
  readonly status = 401;

  constructor() {
    super("Authentication required");
    this.name = "AdminAuthenticationError";
  }
}

export class AdminAuthorizationError extends Error {
  readonly status = 403;

  constructor() {
    super("Halfway Cafe administrator authorization required");
    this.name = "AdminAuthorizationError";
  }
}

export async function requireHalfwayAdmin() {
  const supabase = await createServerComponentClient();
  if (!supabase) throw new AdminAuthenticationError();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new AdminAuthenticationError();
  if (!hasHalfwayAdminClaim(data.user)) throw new AdminAuthorizationError();
  return { supabase, user: data.user };
}
