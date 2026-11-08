# Halfway Cafe Cloudinary Migration Tooling Design

## Purpose

Prepare dependency-free, resumable Node.js tooling that inventories the 99 unique Supabase objects referenced by `site_settings`, `categories`, `menu_items`, and `gallery_images`, plus the two code-only objects `Hero/icon-logo.png` and `Hero/breakfast-hero.webp`. The tooling must not upload, mutate Supabase, or alter Cloudinary unless a later operator supplies explicit execution flags and the exact reviewed manifest digest.

## Boundaries

- Production application files, authentication, admin behavior, Supabase data, Supabase Storage, Cloudinary assets, and environment variables remain unchanged.
- The existing untracked emergency-recovery files are not read as migration inputs and are not modified.
- Unsplash and repository-local images are inventoried only. They are excluded from Cloudinary migration until ownership or redistribution rights are confirmed.
- Runtime state, signed URLs, journals, credentials, and rollback snapshots live outside the repository.
- No commit, push, deployment, upload, deletion, or database write is part of this phase.

## Architecture

The CLI is split into focused ES modules under `scripts/cloudinary/`. It uses Node built-ins only. The inventory layer queries the four public Supabase tables with the anon key, normalizes signed and public Storage URLs to canonical object identities, adds the two explicit code-only objects, downloads bytes in memory, validates supported image signatures and dimensions, and hashes content with SHA-256.

The manifest layer deduplicates both repeated references to the same normalized object and byte-identical objects at different paths. Public IDs are deterministic, lowercase, path-safe, prefixed with `halfway-cafe/`, and suffixed with the first twelve source SHA-256 characters. The canonical path for a content-duplicate group is the lexicographically first normalized object.

The Cloudinary layer provides read-only usage and namespace checks when credentials exist. Upload code is present for later execution, but it is unreachable unless the operator supplies `--execute` and `--confirm-manifest <exact digest>`. Every upload uses `overwrite:false`; an existing target is accepted only when its stored source hash matches, otherwise execution stops on a collision.

The journal layer writes atomic checkpoints outside the repository. It records fingerprints and statuses but never source URLs or credentials. A separate private rollback snapshot contains exact original database values and is also written outside the repository with restrictive file permissions where supported.

## Commands

- `inventory`: build and verify a fresh manifest; this is the default command.
- `audit-cloudinary`: read usage and enumerate `halfway-cafe/` assets; missing credentials produce a non-fatal configuration report.
- `migrate`: dry-run by default. Uploads require `--execute --confirm-manifest <digest>`.
- `verify`: verify the stored manifest digest, prefix isolation, counts, hashes, and mapping invariants.
- `plan-database`: create forward and rollback operation plans without applying them.

## Safety and recovery

Source URLs are used exactly as stored for downloads but are redacted from logs and omitted from the manifest. Retries are limited to network failures, HTTP 408, HTTP 429, and HTTP 5xx responses, honoring `Retry-After`. A bounded timeout and maximum source size protect each download.

Database plans contain only the approved table/field pairs and use optimistic expected-current-value fingerprints. Future application migration will support both Cloudinary and Supabase values before any database update. Rollback restores exact original values while Supabase objects remain retained.

## Delivery design

Future application delivery will use direct Cloudinary URLs and native responsive markup, not Vercel `/_next/image`. URLs use canonical transformation order:

`c_limit,w_<width>/f_auto/q_auto/v<version>/<public-id>.<format>`

The finite width lattice is `96, 192, 256, 384, 640, 828, 1080, 1376, 1600`, filtered by component role and source intrinsic width. Existing alt text, intrinsic dimensions, `sizes`, CSS cropping, lazy loading, and hero fetch priority remain unchanged. `w_auto` and `dpr_auto` are intentionally avoided to cap derivative proliferation.

## Unsplash and administration

Unsplash URLs remain excluded from upload. A later application phase should either deliver them directly from Unsplash with a finite provider-native `srcset` after a rights review, or replace them with owned assets.

Current administration accepts image URLs rather than uploading files. A later phase can continue accepting validated Cloudinary URLs, then optionally add a server-signed Cloudinary upload endpoint or widget. API secrets must remain server-only, and new assets must be restricted to `halfway-cafe/`.

## Verification

Node's built-in test runner covers normalization, deduplication, deterministic IDs, manifest integrity, dry-run upload prevention, idempotent resume, retry rules, collision failure, private state paths, Cloudinary URL syntax, and rollback planning. The live dry-run must produce exactly 101 unique assets and must leave tracked production files unchanged.
