import "server-only";

import { unstable_noStore as noStore } from "next/cache";

/**
 * Mark the current render as uncacheable after a public Supabase read fails.
 *
 * Public pages are rendered with ISR (see `revalidate` in `src/app/layout.tsx`).
 * Without this, a transient Supabase failure would cache the graceful fallback
 * (empty menu, default social links, stale hours) for the whole revalidation
 * window — and, at build time, until the next deploy. Calling this only from
 * catch blocks keeps successful renders cacheable while ensuring failures are
 * retried on the next request.
 */
export function markPublicDataUncacheable(
  context: string,
  error: unknown,
): void {
  noStore();
  console.error(`${context} (render marked uncacheable):`, error);
}
