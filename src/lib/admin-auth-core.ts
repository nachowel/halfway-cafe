export interface AuthClaimSubject {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}

export function hasHalfwayAdminClaim(subject: AuthClaimSubject | null | undefined): boolean {
  return subject?.app_metadata?.role === "halfway_admin";
}
