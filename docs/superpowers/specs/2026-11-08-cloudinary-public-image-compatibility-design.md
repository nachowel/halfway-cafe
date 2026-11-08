# Cloudinary Public Image Compatibility Design

## Goal

Make public menu category pages understand Phase 8E `cloudinary/<public_id>` image references without changing legacy Supabase HTTPS or Unsplash delivery, exposing Cloudinary credentials, modifying production data, or importing the complete Phase 8E release.

## Scope

The fix covers the desktop and mobile render paths for `/menu/[category]`. It audits, but does not automatically expand into, the wider menu landing page, homepage, gallery, or admin previews. Any incompatible paths outside category pages will be reported for a separate change unless they are required for the affected Fish Fingers or Extra Bacon pages.

No menu content, prices, page layout, metadata, schema, migration, deployment, or Cloudinary asset changes are included.

## Architecture

The database value remains a stable logical reference. A server-only resolver will:

1. Accept only references matching the Phase 8E `cloudinary/halfway-cafe/...` contract.
2. Query the existing `resolve_public_image_asset` Supabase RPC for ready registry metadata.
3. Reuse the Phase 8E SHA-256 delivery-path signing implementation and finite responsive-width lattice.
4. Return only signed public Cloudinary URLs and non-secret image metadata to client components.

Legacy HTTPS inputs bypass this resolver and continue through the existing Next.js `Image` component unchanged. Successfully resolved Cloudinary images use a small responsive `<img>` component so they go directly to Cloudinary and never enter `/_next/image`.

## Components

- A pure Cloudinary reference/parser and signing core copied from the relevant Phase 8E implementation, trimmed only to the public menu requirements.
- A server-only registry resolver using the existing Supabase server client.
- A serializable `ResolvedCloudinaryImage` type containing `src`, `srcSet`, dimensions, and widths, but no credentials.
- A responsive Cloudinary image component that preserves existing `alt`, `sizes`, object-fit classes, lazy loading, and intrinsic dimensions.
- Desktop category mapping that resolves only Cloudinary references before passing items to client-rendered cards.
- A mobile server wrapper that loads category data and resolves Cloudinary references before the existing mobile client UI receives it.

The mobile wrapper must preserve the current category filter, active-item visibility, `sort_order` ordering, category counts, search behavior, and displayed fields. Desktop and mobile must receive the same active category item set in the same database order before their presentation-specific rendering.

## Error Handling

Invalid references, missing registry rows, missing server configuration, and registry/provider failures resolve to `null`. Category pages continue rendering and show their existing image placeholder. The server logs a concise diagnostic containing the stage and sanitized public ID; it never logs URLs with signatures, API secrets, Supabase keys, or raw provider responses.

Required production environment variable names are:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_SECRET`

Values must never be serialized to client JavaScript or printed by diagnostics/tests.

## Compatibility

- Supabase signed/public HTTPS URLs remain inputs to `next/image` and retain current optimizer behavior.
- Unsplash HTTPS URLs remain inputs to `next/image` and retain current optimizer behavior.
- Existing SEO metadata is untouched.
- Existing visible alt text and layout classes are retained.
- `next.config.mjs` does not need a Cloudinary remote pattern because resolved Cloudinary images bypass the Next.js optimizer.
- The existing `image_assets` table and `resolve_public_image_asset` RPC are sufficient; no schema or migration is required.

## Testing

Tests will be written before implementation and must first fail for the missing behavior. Coverage includes:

- valid and invalid Phase 8E logical references;
- strict rejection of malformed references, unexpected characters, path traversal, duplicate separators, query/hash fragments, absolute URLs, encoded URL injection, and out-of-namespace public IDs;
- the Phase 8E signing vector/path format and responsive width selection;
- legacy Supabase/Unsplash HTTPS passthrough;
- ready registry metadata resolution;
- missing/erroring registry lookup returning a safe placeholder result;
- a source-boundary check that public category Cloudinary references cannot reach `next/image`;
- TypeScript, lint, production build, and relevant unit tests;
- desktop and mobile browser verification using the existing read-only production data and environment names;
- desktop/mobile parity for category filtering, active visibility, database ordering, counts, search inputs, prices, descriptions, and image placeholders;
- signed delivery HTTP 200 for Fish Fingers and Extra Bacon;
- real image rendering at desktop and mobile viewport sizes for both affected products, plus a working legacy HTTPS menu image at each viewport.

Browser validation is pre-deployment evidence for the review branch only. The report must not state or imply that production is fixed before an approved deployment occurs.

## Delivery

Work occurs on `fix/cloudinary-public-image-compatibility`, based on `origin/master` commit `d4d6b6fd3adc1696b68f72120627d815931a8444`, in an isolated worktree. The branch will be prepared for review only. It will not be merged, pushed, or deployed without further approval.
