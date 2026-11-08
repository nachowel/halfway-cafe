# Cloudinary Application Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Vercel optimization for public migrated and Unsplash images with secure direct responsive delivery while leaving admin, database, storage, Cloudinary configuration, and deployment untouched.

**Architecture:** Generate a safe 101-entry mapping from verified private state, resolve and sign images only in a server module, render direct native responsive markup, and move image-bearing mobile data across server boundaries before it reaches client components.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Node crypto, node:test, native responsive images.

## Global Constraints

- Use the approved manifest digest `ea214f628cdf683990015e595a4946af0333c6a7acc7a8ba8512e79bb94a8cb7`.
- Never expose the API secret, private journal, signed Supabase URLs, or rollback data.
- Use only the finite width lattice `96, 192, 256, 384, 640, 828, 1080, 1376, 1600`.
- Preserve alt text, layout, aspect ratio, lazy loading, hero priority, object-fit, and sizes.
- Leave admin behavior, Supabase, Cloudinary assets/settings, and emergency-recovery files unchanged.
- Do not commit, push, deploy, or modify database records.

---

### Task 1: Safe public mapping

**Files:**
- Create: `scripts/cloudinary/app-mapping.test.mjs`
- Create: `scripts/cloudinary/app-mapping.mjs`
- Create: `scripts/generate-cloudinary-app-mapping.mjs`
- Create: `src/data/cloudinary-assets.v1.json`

**Interfaces:**
- Consumes: verified external `manifest.json` and `journal.private.json`.
- Produces: a deterministic schema-v1 JSON mapping containing only `objectPath`, `publicId`, `version`, `format`, `width`, and `height`.

- [ ] Write a failing test requiring 101 verified entries and rejecting secrets, source URLs, missing versions, mismatched hashes, extras, and unsafe public IDs.
- [ ] Run the focused test and confirm it fails because the mapping builder is absent.
- [ ] Implement deterministic mapping construction and validation.
- [ ] Run the focused test and full migration suite.
- [ ] Generate the mapping from external state and verify its digest and absence of URL/query/secret fields.

### Task 2: Deterministic image resolution core

**Files:**
- Create: `src/lib/public-image-core.ts`
- Create: `src/lib/public-image-core.test.ts`
- Create: `src/types/public-image.ts`

**Interfaces:**
- Consumes: safe mapping entries, cloud name, server secret, source URL/object path, and image role.
- Produces: `ResolvedPublicImage` with direct `src`, optional `srcSet`, intrinsic dimensions, provider, and selected widths.

- [ ] Write failing tests for mapped Supabase URLs, the documented SHA-256 signature algorithm, role widths, intrinsic caps, deterministic output, Unsplash, sanitized legacy Supabase fallback, unknown external URLs, and missing input.
- [ ] Run `node --experimental-strip-types --test src/lib/public-image-core.test.ts` and confirm expected failures.
- [ ] Implement the minimal resolver and re-run focused tests.
- [ ] Add tampering and `/_next/image` absence assertions, then keep the suite green.

### Task 3: Server boundary and renderer

**Files:**
- Create: `src/lib/public-images.server.ts`
- Create: `src/components/ui/ResponsivePublicImage.tsx`
- Create: `src/components/ui/ServerPublicImage.tsx`
- Create: `scripts/cloudinary/application-boundaries.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- `resolvePublicImage(source, role)` reads credentials only on the server.
- `ResponsivePublicImage` consumes only `ResolvedPublicImage` and presentation props.
- `ServerPublicImage` resolves raw sources in Server Components.

- [ ] Write a failing boundary test that rejects secret access or `.server` imports from Client Components and rejects `next/image` in public image components after migration.
- [ ] Add the `server-only` guard and direct native renderer.
- [ ] Verify TypeScript accepts fill and intrinsic layouts, `loading`, `fetchPriority`, `sizes`, and class/style forwarding.

### Task 4: Desktop and shared public surfaces

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/AppChrome.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/DesktopHome.tsx`
- Modify: `src/components/DesktopMenuPage.tsx`
- Modify: `src/components/DesktopCategoryPage.tsx`
- Modify: `src/app/gallery/page.tsx`
- Modify: `src/components/sections/AboutSection.tsx`
- Modify: `src/components/sections/CategoriesSection.tsx`
- Modify: `src/components/sections/CategoryHero.tsx`
- Modify: `src/components/sections/GallerySection.tsx`
- Modify: `src/components/sections/HeroSection.tsx`
- Modify: `src/components/ui/DishCard.tsx`
- Modify: `src/types/index.ts`

**Interfaces:**
- Server components resolve raw URLs and pass descriptors to shared/client components.
- Public renderers emit only direct Cloudinary, Unsplash, sanitized Supabase, external, or local URLs.

- [ ] Convert each shared image prop from raw URL to `ResolvedPublicImage` while preserving its existing presentation props.
- [ ] Resolve database and fallback images on the server with the narrowest applicable role.
- [ ] Run TypeScript and boundary tests.

### Task 5: Mobile server boundaries

**Files:**
- Create: `src/components/MobileHomeServer.tsx`
- Create: `src/components/MobileMenuPageServer.tsx`
- Create: `src/components/MobileCategoryPageServer.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/menu/page.tsx`
- Modify: `src/app/menu/[category]/page.tsx`
- Modify: `src/components/HomeSwitcher.tsx`
- Modify: `src/components/MenuPageSwitcher.tsx`
- Modify: `src/components/CategoryPageSwitcher.tsx`
- Modify: `src/components/MobileHome.tsx`
- Modify: `src/components/MobileMenuPage.tsx`
- Modify: `src/components/MobileCategoryPage.tsx`
- Modify: `src/components/MobileGalleryPage.tsx`

**Interfaces:**
- Server wrappers fetch public data, resolve every image, and pass serializable initial data.
- Client components retain interactive state but never fetch image-bearing Supabase rows or import signing code.

- [ ] Replace each client-side image-data fetch with resolved initial props from a server wrapper.
- [ ] Preserve menu filtering, previews, navigation, reviews, opening-hours display, loading-independent layout, and mobile/desktop switching.
- [ ] Replace every public mobile `next/image` usage with `ResponsivePublicImage`.
- [ ] Run TypeScript, boundary tests, and targeted route renders.

### Task 6: Local SEO routes and Unsplash

**Files:**
- Modify: `src/app/bacon-sandwich-sidcup/page.tsx`
- Modify: `src/app/breakfast-da15/page.tsx`
- Modify: `src/app/breakfast-sidcup/page.tsx`
- Modify: `src/app/brunch-sidcup/page.tsx`
- Modify: `src/app/cafe-near-sidcup-station/page.tsx`
- Modify: `src/app/cafe-sidcup/page.tsx`
- Modify: `src/app/coffee-shop-sidcup/page.tsx`
- Modify: `src/app/eggs-benedict-sidcup/page.tsx`
- Modify: `src/app/full-english-breakfast-sidcup/page.tsx`
- Modify: `src/app/pancakes-sidcup/page.tsx`
- Modify: `src/app/takeaway-sidcup/page.tsx`

**Interfaces:**
- Static server routes use `ServerPublicImage` for migrated or Unsplash images.
- Hardcoded signed Supabase constants are replaced by normalized public object references before resolution.

- [ ] Replace public `next/image` usage and remove hardcoded signed-source exposure from rendered markup.
- [ ] Preserve every route's alt text, sizes, priority, CSS, and structured metadata.
- [ ] Run boundary tests and production rendering checks for all local SEO routes.

### Task 7: Full verification

**Files:**
- Modify only test configuration if required; do not alter application behavior during verification.

**Interfaces:**
- Produces the Phase 7 evidence report.

- [ ] Run mapping, resolver, boundary, and migration tests.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start the production build locally and inspect representative desktop/mobile routes and network requests for direct Cloudinary/Unsplash delivery and zero `/_next/image` requests.
- [ ] Confirm admin files, emergency-recovery files, external migration artifacts, Supabase, Cloudinary state, Git history, and deployment state are unchanged.
