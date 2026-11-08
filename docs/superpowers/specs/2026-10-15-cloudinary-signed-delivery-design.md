# Cloudinary Signed Delivery Design

## Goal

Prepare dependency-free, server-only Cloudinary delivery signing for the 101
Halfway Cafe migration objects while Strict Transformations remains enabled and
the shared Herb & Goods account configuration remains unchanged.

## Chosen approach

Use signed delivery URLs for each responsive image candidate. No named
transformation, transformation allowlist, eager transformation, upload preset,
or account setting is created or changed. A signature authorizes only the exact
post-signature delivery path for one asset version, public ID, extension, and
transformation.

The canonical delivery path is:

```text
c_limit,w_<width>/f_auto/q_auto/v<version>/<public-id>.<format>
```

The URL is:

```text
https://res.cloudinary.com/<cloud>/image/upload/s--<signature>--/<canonical-path>
```

The signature follows Cloudinary's delivery-signature algorithm, which is
different from Upload API parameter signing: append the API secret directly to
the exact canonical path, hash with SHA-256, encode with URL-safe unpadded
Base64, and use the first eight characters. The signing primitive also supports
SHA-1 solely to verify Cloudinary's published `abcd` test vector.

## Responsive behavior

The global candidate lattice remains `96, 192, 256, 384, 640, 828, 1080,
1376, 1600`. For each asset, candidate widths are produced by capping every
lattice width at the intrinsic width and removing duplicates. This guarantees
that no transformation upscales an image while retaining an intrinsic-width
candidate for sources whose width is not itself in the lattice.

`f_auto` and `q_auto` remain separate, visible transformation components after
the resize component. Cloudinary can therefore negotiate browser format and
quality while Strict Transformations authorizes the exact signed path.

## Tooling boundaries

A new delivery module owns canonical path construction, signing, verification,
responsive candidate generation, and delivery-plan integrity. The migration CLI
adds `plan-delivery`, which reads the external manifest and upload journal,
requires all 101 manifest objects to have matching verified journal entries and
positive Cloudinary versions, then writes a private delivery plan under the
existing external state root.

The private plan may contain signed delivery URLs because those URLs are the
eventual public delivery artifacts. It never contains the API secret, signed
Supabase URLs, or upload credentials. CLI output contains counts and digests,
not delivery URLs.

## Failure behavior

Planning fails before writing when the manifest is absent or invalid, the
journal is absent, its manifest digest differs, any object is missing, any
source hash differs, any status is not `verified` or `existing_verified`, or
any Cloudinary version is missing or invalid. Extra journal entries also fail
to prevent mixing namespaces or migrations.

Changing a width, transformation, version, public ID, or extension invalidates
the delivery signature. The command never calls Cloudinary or Supabase and has
no upload, database-write, delete, overwrite, or account-configuration path.

## Rollback and future application use

The existing database plan and exact Supabase rollback values remain unchanged.
Supabase originals remain untouched because automatic Cloudinary backup is
disabled. A future production application change can generate the same signed
URLs in a server-only module or consume an approved server-produced mapping;
the API secret must never enter a Client Component, browser response payload,
public manifest, or log.

## Verification

Tests cover Cloudinary's published delivery-signature vector, SHA-256 URL-safe
encoding, canonical transformation order, tampering of every signed component,
intrinsic-width capping, complete-journal enforcement, secret exclusion, plan
digest integrity, and CLI execution gating. Live verification stops at the
expected pre-upload journal failure and performs no external changes.
