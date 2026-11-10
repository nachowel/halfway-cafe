/**
 * Admin authorization claim.
 *
 * Mirrors the production RLS helper `is_halfway_admin()`, which reads
 * `auth.jwt() -> 'app_metadata' ->> 'role'`. `app_metadata` is only writable
 * with the service role / Dashboard, so it cannot be forged by a user.
 * `user_metadata` is user-writable and is intentionally ignored.
 */

export const HALFWAY_ADMIN_ROLE = "halfway_admin";

export interface AuthClaimSubject {
  app_metadata?: Record<string, unknown> | null;
  /** Present only to document that it is deliberately not trusted. */
  user_metadata?: Record<string, unknown> | null;
}

export function hasHalfwayAdminClaim(
  subject: AuthClaimSubject | null | undefined,
): boolean {
  return subject?.app_metadata?.role === HALFWAY_ADMIN_ROLE;
}
