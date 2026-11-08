# Lightweight QR Menu Implementation Plan

> **For agentic workers:** Execute inline with test-driven development. Do not commit, push, deploy, install dependencies, or modify existing `/menu`, admin, auth, database, RLS, or environment configuration.

**Goal:** Add a server-rendered, mobile-first `/qr-menu` that reads the active Halfway Cafe menu from Supabase and remains fully usable without JavaScript.

**Architecture:** A server-only query module will select only the public category and product fields from Supabase with no static fallback. A pure transformation module will validate, deduplicate, sort, group, and map base/variant prices. The route will render one responsive Server Component tree with anchor navigation and lightweight Tailwind styling.

**Tech Stack:** Next.js 14 App Router, React Server Components, TypeScript, Supabase, Tailwind CSS, Node test runner.

## Global Constraints

- Preserve all pre-existing work.
- Do not modify existing `/menu` routes or admin/auth workflows.
- Do not change schemas, RLS, dependencies, environment variables, or deployment state.
- Supabase remains the only product and price source.
- Price correctness takes precedence over CDN caching in this phase.
- `/qr-menu` must be `noindex, follow` and render product content in initial HTML.

---

### Task 1: Public menu transformation contract

**Files:**
- Create: `src/lib/qr-menu-data.test.ts`
- Create: `src/lib/qr-menu-data.ts`

**Interfaces:**
- Consumes: explicit public category/product row shapes returned by Supabase.
- Produces: `buildQrMenuData(categoryRows, productRows): QrMenuCategory[]` and `getQrMenuPriceOptions(product): QrMenuPriceOption[]`.

- [ ] Write tests proving active-only filtering, stable category/product sorting, ID deduplication, all eleven categories, and explicit Roll/Sandwich/Baguette price labels.
- [ ] Run the tests and confirm they fail because the module does not exist.
- [ ] Implement the smallest pure transformation module that satisfies the tests and rejects invalid prices instead of inventing a fallback value.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Uncached server data source

**Files:**
- Create: `src/lib/qr-menu.server.ts`

**Interfaces:**
- Consumes: `createServerComponentClient()` and the pure transformation contract from Task 1.
- Produces: `getQrMenuData(): Promise<{ status: "ready"; categories: QrMenuCategory[] } | { status: "error" }>`.

- [ ] Query active categories and active products in parallel using explicit selected columns and ascending `sort_order`.
- [ ] Return an error state when configuration, either query, or price validation fails; do not use `src/data/menu.ts`.
- [ ] Keep the function uncached so an admin price change is visible on the next request.
- [ ] Verify the live source still reports 11 active categories and 108 active products without printing credentials.

### Task 3: Server-rendered QR route

**Files:**
- Create: `src/app/qr-menu/page.tsx`

**Interfaces:**
- Consumes: `getQrMenuData()`.
- Produces: the `/qr-menu` route and route metadata.

- [ ] Add `noindex, follow` metadata with `/menu` as canonical.
- [ ] Render a dark-green/gold header, cream content surface, sticky horizontal category navigation, all categories/products, explicit price labels, and an allergen notice.
- [ ] Use semantic headings, landmarks, articles, anchor targets, visible focus styles, and no client component or image dependency.
- [ ] Render a safe unavailable state on query errors without fallback products or stale prices.

### Task 4: Verification

**Files:**
- Test: `src/lib/qr-menu-data.test.ts`

- [ ] Run the new focused tests and the existing public-image tests.
- [ ] Run `npx tsc --noEmit --incremental false`.
- [ ] Check that no prohibited existing route/admin/auth/schema/dependency/environment file changed.
- [ ] If no conflicting dev server is running, run a production build and inspect `/qr-menu` HTML for all 11 category IDs, 108 product articles, no inactive records, and no page-specific JavaScript requirement.
- [ ] Report measured results, skipped checks, remaining risks, and exact local preview instructions.

