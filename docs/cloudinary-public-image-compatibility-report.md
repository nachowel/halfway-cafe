# Cloudinary Public Image Compatibility Verification

Date: 2026-11-08  
Branch: `fix/cloudinary-public-image-compatibility`  
Base: `origin/master` at `d4d6b6fd3adc1696b68f72120627d815931a8444`

## Status

The isolated review branch resolves Phase 8E `cloudinary/<public_id>` references for public desktop and mobile category pages. Production has not been changed and must not be described as fixed until this branch is separately reviewed and deployed.

No production database rows, Cloudinary assets, schema, migrations, prices, content, layout, or SEO metadata were changed. The branch was not pushed, merged, or deployed.

## Root Cause and Data Evidence

The production database currently has 108 active menu items: 106 store HTTPS image URLs and two store Phase 8E logical Cloudinary references. The two logical references are Fish Fingers (`kids-menu`, `sort_order = 1`) and Extra Bacon (`sides-extras`, `sort_order = 1`); neither is featured.

Both references return one row through the existing `resolve_public_image_asset` RPC. The current master category paths supplied their raw values to `next/image`, while `next.config.mjs` only permits the existing Supabase and Unsplash hosts. A value such as `cloudinary/halfway-cafe/admin/...` therefore reached `/_next/image` as if it were an image URL and returned 404. This is an application compatibility gap, not a missing database row, missing Cloudinary asset, or schema problem.

## Implemented Boundary

- Strictly parse only `cloudinary/halfway-cafe/...` logical references.
- Resolve ready metadata through `resolve_public_image_asset` in a server-only module.
- Reuse the Phase 8E SHA-256 signing operation, delivery path order, and finite width lattice.
- Serialize only signed delivery URLs and public dimensions to client components.
- Remove logical Cloudinary source fields before crossing the server/client boundary.
- Render resolved Cloudinary URLs directly with responsive `srcset`, bypassing `/_next/image`.
- Leave Supabase and Unsplash HTTPS values unchanged on their existing `next/image` path.
- Return the existing placeholder and emit a sanitized server diagnostic when parsing, configuration, registry lookup, or registry validation fails.

## Security and Environment Verification

Parser regression coverage rejects missing prefixes, wrong namespaces, uppercase and unexpected characters, spaces, traversal, duplicate separators, trailing slashes, query/hash injection, absolute URL injection, percent-encoded traversal/URL injection, backslashes, plus signs, and control-character injection.

The required production environment variable names are:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_SECRET`

The Vercel CLI confirmed all four names are configured for Production and displayed their values only as `Encrypted`. `CLOUDINARY_API_KEY` is also present but is not required by public delivery resolution. No environment value was printed.

The optimized client output contained no match for the Cloudinary secret value, `CLOUDINARY_API_SECRET`, or `public-menu-images.server` across 63 files in `.next/static`.

## Verification Results

### Automated checks

- `node --no-warnings --experimental-strip-types --test src/lib/public-menu-image-core.test.mjs`: exit 0; 10 tests, 10 passed, 0 failed, 0 skipped.
- `npx tsc --noEmit`: exit 0; no diagnostics.
- `npm run lint`: exit 0; no ESLint warnings or errors.
- `npm run build`: exit 0; compiled, type-checked, generated 33/33 static pages, and completed route output. Existing dynamic-server-usage diagnostics from cookie-backed query helpers were printed during prerender fallback but did not fail the build.
- Client bundle boundary scan: 63 files scanned; 0 secret-value hits, 0 secret-name hits, and 0 server-module-name hits.

### Production-data browser checks against the local production build

| Product / image | Viewport | Delivery | HTTP | Render evidence |
|---|---:|---|---:|---|
| Fish Fingers | 1280×900 | signed direct Cloudinary URL | 200 | visible; `naturalWidth = 422`, `naturalHeight = 633` |
| Fish Fingers | 390×844 card | signed direct Cloudinary URL | 200 | visible; `naturalWidth = 112`, `naturalHeight = 168` |
| Fish Fingers preview | 390×844 | signed direct Cloudinary URL | 200 | visible; `naturalWidth = 342`, `naturalHeight = 513` |
| Extra Bacon | 1280×900 | signed direct Cloudinary URL | 200 | visible; `naturalWidth = 422`, `naturalHeight = 422` |
| Extra Bacon | 390×844 | signed direct Cloudinary URL | 200 | visible; `naturalWidth = 112`, `naturalHeight = 112` |
| Chicken Nuggets (legacy Supabase) | desktop and mobile | existing `/_next/image` path | 200 | visible; non-zero natural dimensions |
| Kids Sausage (legacy Unsplash) | desktop | existing `/_next/image` path | 200 | request succeeded |

No Cloudinary logical reference appeared in rendered HTML, and no request matching `/_next/image.*cloudinary` was emitted.

Kids Menu parity was retained: desktop and mobile both showed Fish Fingers, Chicken Nuggets, Kids Burger, and Kids Sausage in that order; mobile displayed four items and search for `fish` retained Fish Fingers while filtering Chicken Nuggets and Kids Burger. Sides & Extras desktop and mobile both showed the same eight ordered items beginning with Extra Bacon and displayed an eight-item count on mobile.

The existing page title, metadata source, image alt text, `sizes`, layout classes, and category content were not changed.

## Wider Path Audit

- Public `/menu/[category]`: covered by this fix for desktop and mobile.
- Public `/menu`: its 11 active category images are currently HTTPS, so no current production row is affected. Desktop and mobile menu category cards still assume legacy URLs and would need the same boundary if categories later store Cloudinary references.
- Homepage: Fish Fingers and Extra Bacon are not featured, and current category images are HTTPS, so the current homepage is not affected. Mobile featured-item and category rendering still assumes raw legacy URLs and is a future compatibility risk if those fields receive Cloudinary references.
- Gallery: there are currently no active production gallery rows. Public desktop/mobile and admin gallery previews still assume raw legacy URLs and would need separate compatibility work if gallery rows later use logical references.
- Admin menu list and edit-form previews: currently affected for Fish Fingers and Extra Bacon because they pass `image_url` directly to `next/image`. This remains outside the approved public-category scope and is not changed here.
- Admin category previews: current category rows are all HTTPS; future logical references would be incompatible.

## Remaining Risks

1. Production remains unchanged and the two public images will remain broken there until an approved deployment of the reviewed fix.
2. Vercel exposes production values as encrypted, so validation confirms the required names and the locally available signing configuration, not equality of secret values across environments. A preview deployment should repeat the HTTP/render checks before production promotion.
3. Runtime delivery still depends on the existing Supabase RPC/registry row and Cloudinary availability. Failures degrade to placeholders and server diagnostics rather than breaking the category page.
4. Admin previews and future Cloudinary references in homepage, menu-category, or gallery fields remain separate follow-up risks described above.
5. `npm install` reported the repository's existing dependency audit state: 20 vulnerabilities (7 moderate, 12 high, 1 critical). Dependency remediation was not part of this image-compatibility change.

No database migration or data rewrite is required.
