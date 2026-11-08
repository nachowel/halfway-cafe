# Emergency Image Availability Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore every public-facing image without Vercel Image Optimization while preserving layout, accessibility, responsive delivery, and existing administrative behavior.

**Architecture:** Public image render sites use a scoped `PublicImage` adapter. Known static assets resolve to local AVIF/WebP `picture` sources; other public Supabase URLs retain their exact signed source and pass through Next Image with the per-instance `unoptimized` flag. Admin components continue importing `next/image` directly.

**Tech Stack:** Next.js 14.2.35, React 18, TypeScript, native responsive image markup, Sharp CLI for build-time asset preparation.

## Global Constraints

- Do not change global image configuration or `minimumCacheTTL`.
- Do not change database records, Supabase tokens, bucket permissions, authentication, admin components, SEO metadata, or layouts.
- Do not commit, push, or deploy.
- Keep the change reversible by restoring public imports from `PublicImage` to `next/image`.
- Do not expose signed query strings or credentials in generated files or reports.

---

### Task 1: Establish recovery assertions

**Files:**
- Verify: `next.config.mjs`
- Verify: `src/components/admin/**/*.tsx`
- Verify: `src/app/admin/**/*.tsx`

**Interfaces:**
- Consumes: the current clean Phase 1 tree.
- Produces: failing checks that require a scoped public image adapter and local recovery assets.

- [ ] **Step 1: Run an assertion that the recovery adapter and asset directory exist**

```powershell
if (-not (Test-Path src/components/ui/PublicImage.tsx)) { throw "PublicImage recovery adapter missing" }
if (-not (Test-Path public/images/recovery)) { throw "Recovery assets missing" }
```

- [ ] **Step 2: Confirm the assertion fails before implementation**

Expected: failure naming the missing adapter.

- [ ] **Step 3: Record baseline configuration and admin imports**

```powershell
git diff -- next.config.mjs src/app/admin src/components/admin
```

Expected: no output.

### Task 2: Prepare local static responsive assets

**Files:**
- Create: `public/images/recovery/*.{avif,webp}`
- Create: `src/lib/recovery-images.ts`

**Interfaces:**
- Consumes: current desktop/mobile heroes, public logo and breakfast images, repository Unsplash URLs, and current database Unsplash URLs.
- Produces: `getRecoveryImage(src: string): RecoveryImage | null`, where each result contains intrinsic width/height and deterministic AVIF/WebP width candidates.

- [ ] **Step 1: Inventory static source URLs and download originals to a temporary directory**

Use exact existing sources. Strip signed query strings from all logs and never persist tokens.

- [ ] **Step 2: Measure each original**

Record source byte size, intrinsic width, and intrinsic height before conversion.

- [ ] **Step 3: Generate bounded width variants**

Generate only widths from `48, 96, 128, 256, 384, 640, 828, 1080, 1200, 1600` that do not exceed the original width, plus the original width when needed. Encode WebP at quality 82 and AVIF at quality 55; preserve alpha channels and aspect ratios.

- [ ] **Step 4: Create the static manifest**

Register canonical Supabase object paths and Unsplash photo IDs without query parameters. Do not store signed URLs.

- [ ] **Step 5: Verify every manifest candidate exists and is non-empty**

Run a Node assertion over all registered widths and both formats.

### Task 3: Add the narrowly scoped public image adapter

**Files:**
- Create: `src/components/ui/PublicImage.tsx`

**Interfaces:**
- Consumes: standard `ImageProps` and `getRecoveryImage(src)`.
- Produces: default `PublicImage(props: ImageProps)`.

- [ ] **Step 1: Render known static assets with native responsive markup**

Emit AVIF and WebP `source` elements plus a WebP `img` fallback. Preserve `alt`, `sizes`, intrinsic attributes, `className`, `style`, decoding, callbacks, and fill positioning.

- [ ] **Step 2: Preserve LCP loading behavior**

Map `priority` to `loading="eager"` and `fetchPriority="high"`; retain lazy loading for non-priority images.

- [ ] **Step 3: Bypass only public Supabase remotes**

For unmatched `https://*.supabase.co/storage/v1/object/...` sources, return Next Image with `unoptimized` on that instance and preserve the original `src` string byte-for-byte.

- [ ] **Step 4: Retain default optimization for unmatched non-Supabase sources**

Return ordinary Next Image without `unoptimized` for any unmatched source.

### Task 4: Route public render sites through the adapter

**Files:**
- Modify: `src/components/DesktopMenuPage.tsx`
- Modify: `src/components/MobileCategoryPage.tsx`
- Modify: `src/components/MobileGalleryPage.tsx`
- Modify: `src/components/MobileHome.tsx`
- Modify: `src/components/MobileMenuPage.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/sections/AboutSection.tsx`
- Modify: `src/components/sections/CategoriesSection.tsx`
- Modify: `src/components/sections/CategoryHero.tsx`
- Modify: `src/components/sections/GallerySection.tsx`
- Modify: `src/components/sections/HeroSection.tsx`
- Modify: `src/components/ui/DishCard.tsx`
- Modify: public SEO and gallery pages importing `next/image`

**Interfaces:**
- Consumes: `PublicImage` with the existing Next Image prop contract.
- Produces: unchanged component markup and props except for the import source.

- [ ] **Step 1: Replace only public `next/image` imports**

Use `import Image from "@/components/ui/PublicImage";` while leaving JSX, alt text, sizes, dimensions, priority, loading, class names, and styles unchanged.

- [ ] **Step 2: Prove admin remains untouched**

```powershell
git diff -- src/app/admin src/components/admin
```

Expected: no output.

- [ ] **Step 3: Prove global configuration remains untouched**

```powershell
git diff -- next.config.mjs
```

Expected: no output.

### Task 5: Static and build verification

**Files:**
- Verify all changed files.

**Interfaces:**
- Consumes: completed recovery implementation.
- Produces: evidence for type safety, lint safety, and production compilation.

- [ ] **Step 1: Run recovery assertions**

Check manifest files, public imports, unchanged admin imports, and unchanged global configuration.

- [ ] **Step 2: Run TypeScript**

```powershell
npx tsc --noEmit
```

- [ ] **Step 3: Run lint**

```powershell
npm run lint
```

- [ ] **Step 4: Run production build**

```powershell
npm run build
```

### Task 6: Responsive runtime verification

**Files:**
- Verify built application only.

**Interfaces:**
- Consumes: local production build and representative route list.
- Produces: route-by-route image, network, layout, and bandwidth evidence.

- [ ] **Step 1: Start the production server locally**

Run `npm run start` on an unused local port.

- [ ] **Step 2: Check representative routes at 390, 768, and 1440 CSS pixels**

Cover homepage, menu, all category routes, gallery, About, and every SEO landing page.

- [ ] **Step 3: Assert recovered image network behavior**

For each route, scroll the full page and assert no public image returns an error and no recovered asset requests `/_next/image`.

- [ ] **Step 4: Inspect LCP and layout evidence**

Confirm the visible hero has `fetchpriority="high"`, has non-zero intrinsic/display dimensions, and does not introduce image-caused layout overflow.

- [ ] **Step 5: Measure dynamic original bandwidth**

Compare raw Supabase `Content-Length` with the displayed CSS dimensions for mobile cards and report the worst regressions without altering content.

- [ ] **Step 6: Stop the local server and leave the worktree uncommitted**

Report changed files, test results, coverage, remaining risks, and rollback instructions.
