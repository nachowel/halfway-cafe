# Halfway Cafe Cloudinary Migration Runbook

## Current phase

This tooling prepares and verifies a migration. The default command is read-only and no command applies database changes. Phase 5 authorizes only a reviewed, exact-public-ID pilot upload; the remaining assets are not approved.

The script includes the 99 unique Supabase objects referenced by `site_settings`, `categories`, `menu_items`, and `gallery_images`, plus:

- `Hero/icon-logo.png`
- `Hero/breakfast-hero.webp`

The expected inventory is exactly 101 unique Supabase objects. Inventory drift stops the script for review.

## Requirements

- Node.js 18 or later.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the process environment or the existing `.env.local`.
- The migration CLI explicitly reads the repository `.env.local` before
  applying any already-present process-environment overrides. Cloudinary
  checks require these variables in either location:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

Never commit Cloudinary credentials. The script does not write credentials to disk or print them.

## External state

Runtime state defaults to an operating-system state directory outside the repository:

- Windows: `%LOCALAPPDATA%\HalfwayCafe\cloudinary-migration`
- Linux/macOS: `$XDG_STATE_HOME/halfway-cafe/cloudinary-migration` or `~/.local/state/halfway-cafe/cloudinary-migration`

`HALFWAY_MIGRATION_STATE_DIR` may select another location, but the CLI rejects any location inside the repository. Manifests, journals, account audits, original signed URLs, and rollback plans all stay in this external directory. Private JSON files are written atomically with mode `0600` where the operating system supports POSIX permissions.

## Safe commands

Build the inventory and manifest:

```powershell
node scripts/cloudinary-migration.mjs inventory
```

With no command, `inventory` is used. It queries Supabase and downloads source bytes for validation; it does not upload or modify anything.

Verify the stored manifest without network access:

```powershell
node scripts/cloudinary-migration.mjs verify
```

Read Cloudinary usage, product-environment folder mode, and only the
`halfway-cafe/` namespace:

```powershell
node scripts/cloudinary-migration.mjs audit-cloudinary
```

If credentials are missing, this reports their names and exits without blocking inventory or tests.

The Admin API `GET /config?settings=true` response currently exposes folder
mode, but not the Strict Transformations or automatic-backup switches. Confirm
those two settings in the Cloudinary Console before approving uploads or direct
responsive delivery. Do not test Strict Transformations by requesting a new
derived asset during an audit: that probe can create a transformation and consume
account resources.

Preview migration behavior without uploading:

```powershell
node scripts/cloudinary-migration.mjs migrate
```

## Upload gate for a later approved phase

Uploads require both flags and an exact reviewed digest:

```powershell
node scripts/cloudinary-migration.mjs migrate --execute --confirm-manifest <64-character-manifest-sha256>
```

The script refuses execution if the digest differs, credentials are missing, the namespace contains a conflicting public ID, the source bytes changed, or the journal belongs to another manifest. Every upload uses `overwrite=false`, `unique_filename=false`, and a public ID beginning with `halfway-cafe/`. No Cloudinary delete or overwrite operation exists in the tooling.

## Controlled single-image pilot

Preview one exact manifest destination without refreshing or replacing the reviewed manifest:

```powershell
node scripts/cloudinary-migration.mjs migrate --only-public-id <halfway-cafe/public-id>
```

The only authorized Phase 5 upload form adds both existing execution gates:

```powershell
node scripts/cloudinary-migration.mjs migrate --only-public-id <halfway-cafe/public-id> --execute --confirm-manifest <64-character-manifest-sha256>
```

Single-image mode loads the existing 101-object manifest and private source snapshot from external state. It downloads only the selected URL, verifies its URL fingerprint, object path, SHA-256, byte size, format, and dimensions, then audits the complete `halfway-cafe/` namespace before attempting one `overwrite=false` upload. It refuses a selector not represented exactly once and refuses to treat a pre-existing asset as a new pilot upload.

After Cloudinary returns and passes source-integrity verification, the verified asset ID and version are atomically checkpointed in the private journal. The command then requests three signed `c_limit,w_<width>/f_auto/q_auto` variants directly from `res.cloudinary.com`, checks HTTP 200, decodes PNG/JPEG/WebP/AVIF bytes, verifies expected dimensions, and confirms that no URL uses Vercel `/_next/image`. URLs, signatures, source URLs, and secrets are not printed. If post-upload delivery validation fails, the verified journal entry is retained for investigation and the command exits unsuccessfully; it does not upload another asset.

## Deterministic mapping

Public IDs use this form:

```text
halfway-cafe/<normalized-bucket>/<normalized-path-without-extension>--<source-sha256-first-12>
```

Repeated signed URLs for one Supabase object collapse to one source object. Byte-identical objects at different paths share the public ID derived from the lexicographically first source path. The manifest retains every database reference and URL fingerprint but never stores signed URLs.

## Integrity and retries

Before an asset can enter the manifest, the tooling verifies:

- Successful HTTP response.
- Maximum source size.
- PNG, JPEG, or WebP signature.
- Positive intrinsic dimensions.
- Exact byte length.
- SHA-256 digest.

Migration verifies Cloudinary public ID, stored source hash, format, byte length, width, and height. HTTP 408, 429, 5xx, and network errors are retried with bounded exponential backoff. Permanent 4xx failures stop immediately.

## Cloudinary delivery design

Strict Transformations is enabled for the shared Cloudinary account. Halfway
Cafe therefore uses signed delivery URLs instead of changing account-wide
allowlists or named transformations. The future application component must
receive URLs generated in trusted server-side code and emit them directly,
bypassing Vercel `/_next/image`:

```text
https://res.cloudinary.com/<cloud>/image/upload/s--<signature>--/c_limit,w_<width>/f_auto/q_auto/v<version>/<public-id>.<format>
```

The dependency-free signer follows Cloudinary's delivery URL algorithm, not
Upload API parameter signing. It signs the exact path after the signature
component by appending the API secret, hashing with SHA-256, encoding as
URL-safe unpadded Base64, and using the first eight characters. The API secret
must remain in migration tooling or a future server-only module. A URL
signature is expected to appear in browser HTML and requests; it authorizes
only its exact transformation, version, public ID, and extension and does not
reveal the API secret.

Use the finite width lattice:

```text
96, 192, 256, 384, 640, 828, 1080, 1376, 1600
```

Cap every lattice width at the intrinsic width and remove duplicates. This
retains an intrinsic-width endpoint without permitting an upscale. Filter the
result further by the component's actual `sizes` value. `c_limit` preserves
aspect ratio, while visible, separately chained `f_auto` and `q_auto`
components keep browser format and quality negotiation compatible with signed
Strict Transformations. Do not use `w_auto` or `dpr_auto`; explicit `srcset`
candidates cap the number of Cloudinary derivatives.

Suggested role subsets:

- Logos: 96, 192.
- Menu/category thumbnails: 192, 256, 384.
- Cards: 384, 640, 828.
- Modals/content: 640, 828, 1080.
- Heroes: 640, 828, 1080, 1376, 1600, capped to source width.

The application phase must preserve alt text, intrinsic dimensions, existing `sizes`, CSS `object-fit`, lazy loading, and hero `fetchpriority="high"`. Versioned Cloudinary URLs should be used so cache changes remain explicit.

## Database preparation and rollback

After a separately approved upload completes, first generate the private signed
delivery plan:

```powershell
node scripts/cloudinary-migration.mjs plan-delivery
```

This command refuses to run unless every manifest destination has a matching
`verified` or `existing_verified` journal record, matching source hash, and
positive Cloudinary version. It writes `delivery-plan.private.json` only under
the external state root and prints no URLs or credentials. It makes no network
requests.

Then generate—but do not apply—the database plan:

```powershell
node scripts/cloudinary-migration.mjs plan-database
```

The resulting private file contains exact original signed URLs, Cloudinary replacements, optimistic expected-value hashes, and exact inverse rollback operations. It targets only:

- `site_settings.value`
- `categories.image_url`
- `menu_items.image_url`
- `gallery_images.url`

There is intentionally no command that applies this plan. A future approved database tool must update only rows whose current values still match the snapshot. Supabase objects and the private rollback snapshot should be retained throughout the observation period.

Automatic Cloudinary backup remains disabled because this is a shared account.
Supabase originals must remain untouched and available throughout migration and
rollback; deleting them would remove the recovery source for Cloudinary asset
loss.

## Unsplash plan

Unsplash images are excluded from this migration because ownership and redistribution rights have not been established. They currently still rely on `next/image` in public components and therefore require a separate application change.

Recommended sequence:

1. Inventory which of the 27 tracked photo IDs are active, fallback-only, or dead.
2. Confirm the permitted delivery and attribution requirements for every active image.
3. For retained images, replace `next/image` only at public Unsplash call sites with a provider-native finite `srcset`. Keep the `images.unsplash.com` origin and vary only approved width/quality/format parameters.
4. Preserve current crop, `sizes`, alt text, lazy loading, and LCP behavior.
5. Replace broken or unlicensed images with owned assets; only owned replacements may enter `halfway-cafe/`.
6. Verify that migrated Unsplash call sites make no `/_next/image` requests.

Do not copy Unsplash files into Cloudinary without explicit rights confirmation.

## Future admin behavior

The current admin accepts pasted image URLs and does not upload files. The first
application migration should keep that workflow and add validation for
versioned Cloudinary URLs under the approved cloud and `halfway-cafe/` prefix.
Server-only application code must sign each responsive candidate; API secrets
must never be imported by Client Components or serialized in browser payloads.
Admin previews should use the same server-produced direct-CDN URLs so they do
not consume Vercel optimization.

A later optional upload workflow should use a server-only signed endpoint or a tightly scoped signed Cloudinary Upload Widget. The API secret must never reach the browser. New public IDs must use `halfway-cafe/`, `overwrite=false`, integrity metadata, and the same finite delivery widths. Supabase URL support should remain available during rollback until the migration is formally closed.
