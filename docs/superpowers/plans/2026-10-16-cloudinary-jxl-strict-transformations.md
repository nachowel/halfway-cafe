# Cloudinary JPEG XL Strict Transformations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the failing `f_auto` application delivery URLs with the smallest deterministic, signed, application-code-only format strategy that returns decodable images under the existing Strict Transformations configuration.

**Architecture:** Keep the approved 101-asset mapping, versions, public IDs, intrinsic metadata, and responsive width lattice unchanged. Generate signed Cloudinary paths as `c_limit,w_<width>/q_auto/f_webp/...`, placing the explicit output format last so small JPEG inputs cannot be retained as JPEG by a later `q_auto` component. Continue passing public-safe resolved image descriptors across the server/client boundary and delivering directly from `res.cloudinary.com`.

**Tech Stack:** Next.js 14, React, TypeScript, Node test runner, Cloudinary signed delivery URLs, Playwright/Chromium verification.

## Global Constraints

- Do not modify Cloudinary account settings, uploaded originals, Supabase, database records, or Herb & Goods resources.
- Do not change the approved 101-asset mapping, deterministic public IDs, versions, intrinsic dimensions, or responsive widths.
- Keep the Cloudinary API secret in server-only code.
- Do not reintroduce Vercel `/_next/image` delivery.
- Preserve public image alt text, layout, loading priority, CSS behavior, and SEO output.
- Do not commit, push, or deploy.

---

### Task 1: Lock the explicit WebP delivery contract with a failing test

**Files:**
- Modify: `src/lib/public-image-core.test.ts`

**Interfaces:**
- Consumes: `createPublicImageResolver()` and `signCloudinaryDeliveryPath()`.
- Produces: regression expectations that every mapped URL uses `q_auto/f_webp`, contains no `f_auto`, stays direct, and retains the approved responsive widths.

- [ ] Add a literal expected URL for a mapped asset using `c_limit,w_1024/q_auto/f_webp/...` and its independently calculated signature.
- [ ] Assert both `src` and every `srcSet` candidate omit `f_auto` and `/_next/image`.
- [ ] Run `node --test src/lib/public-image-core.test.ts` and confirm it fails because production still emits `f_auto/q_auto`.

### Task 2: Implement the minimal deterministic format change

**Files:**
- Modify: `src/lib/public-image-core.ts`

**Interfaces:**
- Consumes: unchanged `CloudinaryAssetMappingEntry`, width lattice, role selection, cloud name, and API secret.
- Produces: deterministic signed `q_auto/f_webp` URLs for mapped Cloudinary assets.

- [ ] Change only the signed Cloudinary transformation path from `f_auto/q_auto` to `q_auto/f_webp`.
- [ ] Run `node --test src/lib/public-image-core.test.ts` and confirm all resolver tests pass.
- [ ] Run the full Cloudinary/application test suite and confirm no mapping, boundary, fallback, or signature regression.

### Task 3: Verify provider and browser behavior

**Files:**
- No production file changes expected.

**Interfaces:**
- Consumes: the built application and generated signed delivery URLs.
- Produces: HTTP and Chromium evidence for hero, menu, drink, and logo images at multiple approved widths.

- [ ] Request representative explicit WebP URLs twice with Chromium-compatible Accept headers.
- [ ] Verify HTTP 200, `image/webp`, decoded expected dimensions, immutable cache headers, and cache HIT behavior.
- [ ] Build and run the local production application.
- [ ] Verify desktop and mobile routes render images with non-zero natural dimensions, direct `res.cloudinary.com` requests, and no `/_next/image` requests.

### Task 4: Complete local quality and security gates

**Files:**
- Verify all Phase 7 and Phase 7B changes without additional feature work.

**Interfaces:**
- Consumes: final local working tree.
- Produces: evidence-backed preview deployment recommendation.

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run lint`.
- [ ] Run all Node tests.
- [ ] Run `npm run build` and record pre-existing non-fatal diagnostics separately.
- [ ] Confirm no admin diffs, no private migration artifacts in the public mapping/client boundary, and no Cloudinary secret in client bundles.
- [ ] Stop the local server without committing, pushing, or deploying.

