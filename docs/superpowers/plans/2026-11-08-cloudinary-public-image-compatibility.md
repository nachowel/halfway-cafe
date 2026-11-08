# Cloudinary Public Image Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve Phase 8E `cloudinary/<public_id>` references safely on public desktop and mobile category pages while leaving existing Supabase and Unsplash `next/image` behavior unchanged.

**Architecture:** A pure, testable core reuses Phase 8E reference parsing, SHA-256 path signing, and responsive width selection. A server-only adapter queries the existing `resolve_public_image_asset` RPC and converts only valid Cloudinary references to serializable signed URLs; legacy HTTPS strings bypass the adapter unchanged. Desktop and mobile category server components remove logical references before client rendering, and a direct responsive image component keeps Cloudinary URLs out of the Next.js optimizer.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Supabase RPC, Node `crypto`, Node test runner, Playwright browser inspection.

## Global Constraints

- Work only in `C:\Users\nacho\Desktop\Halfway-cloudinary-image-fix` on `fix/cloudinary-public-image-compatibility`.
- Do not modify production data, Cloudinary assets, schema, migrations, prices, content, layout, or SEO metadata.
- Reuse the Phase 8E SHA-256 delivery signing algorithm and canonical path order exactly.
- Never serialize or log `CLOUDINARY_API_SECRET` or Supabase credentials.
- Preserve legacy Supabase/Unsplash URLs and their existing `next/image` path.
- Missing/failed registry lookups render the existing placeholder and log only a safe server diagnostic.
- Do not merge, push, deploy, or claim production is fixed.

---

### Task 1: Pure Reference, Signing, and Resolution Core

**Files:**
- Create: `src/types/public-image.ts`
- Create: `src/lib/public-menu-image-core.ts`
- Test: `src/lib/public-menu-image-core.test.ts`

**Interfaces:**
- Produces: `parseCloudinaryReference(value): string | null`
- Produces: `signCloudinaryDeliveryPath(deliveryPath, apiSecret): string`
- Produces: `resolvePublicMenuImageCore(input): Promise<PublicMenuImageResolution>`
- Produces: `ResolvedPublicImage`, `PublicImageRole`, and registry metadata types.

- [ ] **Step 1: Write failing parser and security tests**

Cover the valid Phase 8E form and reject empty/missing prefixes, other namespaces, uppercase/unexpected characters, spaces, `..`, `//`, trailing slashes, query/hash fragments, absolute URLs, percent-encoded traversal/URL injection, backslashes, and control characters. Each rejected `cloudinary/` candidate must resolve as a safe Cloudinary placeholder result, never as legacy input.

- [ ] **Step 2: Run the parser tests and verify RED**

Run: `node --experimental-strip-types --test src/lib/public-menu-image-core.test.ts`

Expected: module-not-found failure because the production core does not exist.

- [ ] **Step 3: Implement the Phase 8E parser and signer**

Copy the Phase 8E constants and algorithm:

```ts
const CLOUDINARY_REFERENCE_PREFIX = "cloudinary/";
const PUBLIC_ID_PATTERN = /^halfway-cafe\/[a-z0-9][a-z0-9/_-]*$/;

export function signCloudinaryDeliveryPath(path: string, secret: string) {
  return createHash("sha256")
    .update(`${path}${secret}`)
    .digest("base64url")
    .slice(0, 8);
}
```

Use the exact Phase 8E delivery path:

```text
c_limit,w_<width>/q_auto/f_webp/v<version>/<public-id>.<format>
```

Use the exact finite width lattice `96, 192, 256, 384, 640, 828, 1080, 1376, 1600` and role targets from Phase 8E.

- [ ] **Step 4: Add failing resolution tests**

Test legacy HTTPS passthrough, ready registry metadata, missing rows, lookup exceptions, missing configuration, safe diagnostics, no secret in serialized output, and the Fish Fingers/Extra Bacon width selection.

- [ ] **Step 5: Run resolution tests and verify RED for unresolved functions**

Run the same Node test command and confirm failures identify missing resolution behavior.

- [ ] **Step 6: Implement minimal resolution behavior**

Return one of:

```ts
type PublicMenuImageResolution =
  | { kind: "none" }
  | { kind: "legacy"; source: string }
  | { kind: "cloudinary"; image: ResolvedPublicImage | null };
```

Inject `lookup(publicId)` and `diagnostic(event)` so tests do not import server modules. Any string beginning `cloudinary/` is consumed as a Cloudinary candidate; malformed candidates can never fall back to `legacy`.

- [ ] **Step 7: Run tests and verify GREEN**

Run: `node --experimental-strip-types --test src/lib/public-menu-image-core.test.ts`

- [ ] **Step 8: Commit**

```powershell
git add src/types/public-image.ts src/lib/public-menu-image-core.ts src/lib/public-menu-image-core.test.ts
git commit -m "fix: resolve Cloudinary menu image references"
```

### Task 2: Server-Only Registry Adapter

**Files:**
- Create: `src/lib/public-menu-images.server.ts`
- Test: `src/lib/public-menu-image-core.test.ts`

**Interfaces:**
- Consumes: `resolvePublicMenuImageCore` from Task 1.
- Produces: `resolvePublicMenuImage(source, role): Promise<PublicMenuImageResolution>`.

- [ ] **Step 1: Write failing adapter-contract tests in the pure core**

Exercise the real resolution contract with injected registry behavior: a ready row produces signed public URLs, a missing row and a thrown lookup produce a Cloudinary placeholder result, malformed references never become legacy sources, and serialized results/diagnostics never contain the supplied secret.

- [ ] **Step 2: Run the adapter-contract test and verify RED**

Run: `node --experimental-strip-types --test src/lib/public-menu-image-core.test.ts`

- [ ] **Step 3: Implement the server adapter**

Use `createServerComponentClient()` and:

```ts
supabase.rpc("resolve_public_image_asset", { p_public_id: publicId })
```

Return the first ready row or `null`. Pass only env values into the pure core. Log diagnostics as structured stage plus already-validated public ID; invalid references log only the stage.

- [ ] **Step 4: Run core tests plus TypeScript and verify GREEN**

Run the core test file and `npx tsc --noEmit`; the compiler enforces that client components receive only serializable result types and do not import the server-only adapter.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/public-menu-images.server.ts src/lib/public-menu-image-core.test.ts
git commit -m "fix: add server-only Cloudinary registry adapter"
```

### Task 3: Desktop Category Rendering

**Files:**
- Create: `src/components/ui/ResponsivePublicImage.tsx`
- Modify: `src/types/index.ts`
- Modify: `src/components/DesktopCategoryPage.tsx`
- Modify: `src/components/ui/DishCard.tsx`
- Test: `src/lib/public-menu-image-core.test.ts`

**Interfaces:**
- Consumes: `resolvePublicMenuImage` and `ResolvedPublicImage`.
- Produces: menu items whose `image` remains an unchanged legacy URL or whose `resolvedImage` contains signed Cloudinary delivery metadata.

- [ ] **Step 1: Extend transformation behavior tests and verify RED**

Test a shared item transformation helper with real objects: legacy input retains the exact URL, successful Cloudinary resolution removes the logical source and attaches `resolvedImage`, and failed/invalid Cloudinary resolution removes the logical source and attaches no client image URL.

- [ ] **Step 2: Implement direct responsive Cloudinary rendering**

Port the Phase 8E `<img>` implementation, preserving `alt`, `sizes`, fill positioning, intrinsic dimensions, lazy loading, `fetchPriority`, decoding, and existing classes.

- [ ] **Step 3: Resolve desktop items before the client boundary**

For `legacy`, retain `item.image` byte-for-byte. For `cloudinary`, remove `item.image` and attach `resolvedImage`, including `null` on failure so the existing placeholder renders.

- [ ] **Step 4: Run tests, TypeScript, and lint**

```powershell
node --experimental-strip-types --test src/lib/public-menu-image-core.test.ts
npx tsc --noEmit
npm run lint
```

- [ ] **Step 5: Commit**

```powershell
git add src/components/ui/ResponsivePublicImage.tsx src/types/index.ts src/components/DesktopCategoryPage.tsx src/components/ui/DishCard.tsx src/lib/public-menu-image-core.test.ts
git commit -m "fix: render resolved Cloudinary images on desktop menus"
```

### Task 4: Mobile Server Data and Parity

**Files:**
- Create: `src/components/MobileCategoryPageServer.tsx`
- Modify: `src/app/menu/[category]/page.tsx`
- Modify: `src/components/CategoryPageSwitcher.tsx`
- Modify: `src/components/MobileCategoryPage.tsx`
- Test: `src/lib/public-menu-image-core.test.ts`

**Interfaces:**
- Consumes: existing `getCategories`, `getMenuItemsByCategory`, and `getMenuItems` query ordering/visibility behavior plus `resolvePublicMenuImage`.
- Produces: preloaded mobile categories, category items, and count rows in the same order and active visibility as the existing client queries.

- [ ] **Step 1: Extend mobile parity behavior tests and verify RED**

Exercise the shared item transformation over an ordered fixture containing active category items, a legacy image, a valid Cloudinary reference, and a failed Cloudinary reference. Assert input order and visible fields are unchanged while only image representation changes. Browser verification will cover the real server/client composition.

- [ ] **Step 2: Add the mobile server wrapper**

Fetch active ordered categories, active ordered category items, and active count rows concurrently. Resolve item images exactly as desktop does. Remove logical Cloudinary sources before serialization; preserve legacy `image_url` unchanged.

- [ ] **Step 3: Convert the existing mobile component to props**

Remove only the client data-fetch effect and loading mutation. Keep search filtering, item ordering, category counts, price/description rendering, preview behavior, visibility, and all layout classes unchanged. Render resolved Cloudinary images directly and legacy `image_url` through the existing `Image` component.

- [ ] **Step 4: Run tests, TypeScript, and lint**

Run the same commands as Task 3 and verify no client/server import boundary errors.

- [ ] **Step 5: Commit**

```powershell
git add src/components/MobileCategoryPageServer.tsx src/app/menu/[category]/page.tsx src/components/CategoryPageSwitcher.tsx src/components/MobileCategoryPage.tsx src/lib/public-menu-image-core.test.ts
git commit -m "fix: resolve Cloudinary images on mobile menus"
```

### Task 5: Wider Audit and End-to-End Verification

**Files:**
- Create: `docs/cloudinary-public-image-compatibility-report.md`
- Modify only if a test exposes a category-path defect in files from Tasks 1-4.

**Interfaces:**
- Produces: review evidence and an explicit remaining-path risk list.

- [ ] **Step 1: Audit wider image call sites without expanding scope**

Inspect `/menu`, homepage featured/category paths, gallery paths, admin list/form previews, and their database fields. Record current affected rows and future compatibility risks. Do not change these paths unless they are required for `/menu/[category]` correctness.

- [ ] **Step 2: Run the full static verification**

```powershell
node --experimental-strip-types --test src/lib/public-menu-image-core.test.ts
npx tsc --noEmit
npm run lint
npm run build
```

- [ ] **Step 3: Verify environment-name and client-bundle boundaries**

Confirm the four required names without printing values. Search `.next/static` for `CLOUDINARY_API_SECRET` and server-only module names; no secret-bearing code may appear in client chunks.

- [ ] **Step 4: Start the review branch locally with read-only environment values**

Load the existing environment into the process without creating an env file in the worktree. Start the built application on an unused port.

- [ ] **Step 5: Verify signed delivery and browser rendering**

For Fish Fingers and Extra Bacon, confirm signed Cloudinary image responses are HTTP 200. At desktop and mobile viewport sizes, confirm `naturalWidth > 0`, no Cloudinary logical reference reaches `/_next/image`, and one legacy HTTPS image also renders. Compare item names/order/counts and search behavior between viewports.

- [ ] **Step 6: Record truthful status**

State that the review branch passes pre-deployment verification; explicitly state production remains unchanged until a separately approved deployment.

- [ ] **Step 7: Commit**

```powershell
git add docs/cloudinary-public-image-compatibility-report.md
git commit -m "docs: record Cloudinary compatibility verification"
```

- [ ] **Step 8: Request code review and run final verification**

Use `superpowers:requesting-code-review`, address verified findings, then rerun the complete static and browser verification before reporting.
