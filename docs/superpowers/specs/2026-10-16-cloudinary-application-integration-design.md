# Cloudinary Application Integration Design

## Goal

Integrate all verified Halfway Cafe images into the local Next.js application using direct, responsive, SHA-256-signed Cloudinary delivery while keeping private migration state and the API secret server-only.

## Architecture

The application stores a versioned public mapping at `src/data/cloudinary-assets.v1.json`. Each of its 101 entries contains only the normalized Supabase object path, Cloudinary public ID and version, source format, and intrinsic dimensions. A generator validates the private manifest and journal outside the repository, then emits this safe mapping without source URLs, signatures, asset IDs, credentials, or rollback data.

`src/lib/public-image-core.ts` owns deterministic URL normalization, finite role-specific width selection, SHA-256 delivery signing, Cloudinary URL construction, Unsplash URL construction, and safe legacy fallback behavior. It accepts the secret as an argument so its behavior can be tested without coupling tests to the runtime environment.

`src/lib/public-images.server.ts` is the only module that reads `CLOUDINARY_API_SECRET`. It is guarded with `server-only`, imports the safe mapping, and resolves a raw database URL or known object path into a serializable `ResolvedPublicImage`. Client components receive only this descriptor.

`src/components/ui/ResponsivePublicImage.tsx` renders native `<img>` markup with direct `src` and `srcSet` values. It preserves `alt`, `sizes`, width/height or fill layout, lazy/eager loading, `fetchPriority`, CSS classes, and object-fit behavior. It never imports the signer or private state.

Interactive mobile views receive fully resolved initial data from server wrappers. They do not import server-only modules or fetch image-bearing Supabase rows in the browser. Admin pages and their current URL editing workflow are unchanged.

## Delivery behavior

Cloudinary paths use exactly `c_limit,w_<width>/f_auto/q_auto/v<version>/<public-id>.<format>`. Widths come only from `96, 192, 256, 384, 640, 828, 1080, 1376, 1600`, capped to intrinsic width and filtered by a stable role preset: logo, thumbnail, card, content, or hero. The largest selected candidate is `src`; the complete selected set is `srcSet`.

Unsplash images remain at `images.unsplash.com` with deterministic `auto=format`, `fit=max`, `q=80`, and explicit finite widths. Unknown external images remain direct URLs. Unmapped signed Supabase URLs are converted to query-free public URLs so signed tokens never cross the server boundary.

## Security boundaries

- The API secret is read only by `public-images.server.ts`.
- Client components receive public Cloudinary signatures, never the signing secret.
- The private manifest, journal, delivery plan, and rollback snapshot remain outside the repository and are not runtime dependencies.
- The public mapping contains no source URLs, query tokens, credentials, asset IDs, or signatures.
- No production image component imports migration tooling.
- Admin code is not changed.

## Coverage

The integration covers desktop and mobile home, menu landing, category/item cards and previews, gallery, navbar/logo, static section imagery, delivery-platform logos, and all local SEO landing pages using migrated images. Existing local icons and Open Graph files remain local. Admin image previews remain on their existing path.

## Failure behavior

Malformed or missing image input resolves to no image. A known mapped object without usable server credentials falls back to its query-free public Supabase URL. Unknown Supabase objects use the same sanitized public fallback. Unknown external URLs remain direct. Invalid Cloudinary configuration never reaches the client as an exception containing a secret.

## Verification

Tests cover mapping safety and completeness, URL normalization, SHA-256 signatures, width presets and intrinsic caps, deterministic output, Unsplash delivery, legacy fallback, missing images, client/server dependency boundaries, and absence of `/_next/image`. TypeScript, ESLint, application image tests, the migration tests, production build, and browser request inspection must pass before a GO recommendation.
