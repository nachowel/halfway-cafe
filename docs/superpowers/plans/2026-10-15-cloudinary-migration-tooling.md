# Cloudinary Migration Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build dependency-free, dry-run-first migration tooling for 101 Halfway Cafe Supabase images without changing production application code or external state.

**Architecture:** Focused Node.js ES modules inventory Supabase, validate and hash image bytes, create a deterministic manifest, audit Cloudinary read-only, and gate resumable uploads behind explicit execution confirmation. All sensitive runtime artifacts live outside the repository.

**Tech Stack:** Node.js 18+ built-ins, native `fetch`, `node:test`, Supabase REST, Cloudinary REST APIs.

## Global Constraints

- Dry-run is the default; no uploads without `--execute` and an exact manifest digest.
- Include exactly 101 unique Supabase objects and enforce `halfway-cafe/` public IDs.
- Do not modify production application code, Supabase, Cloudinary assets, environment variables, or prior emergency-recovery files.
- Do not commit, push, or deploy.
- Keep signed URLs, credentials, journals, and rollback snapshots outside version control.

---

### Task 1: Core normalization, IDs, integrity, and retry behavior

**Files:**
- Create: `scripts/cloudinary/core.test.mjs`
- Create: `scripts/cloudinary/core.mjs`

**Interfaces:**
- Produces URL normalization, redaction, hashing, public-ID generation, image metadata parsing, canonical JSON, retry classification, and retry execution.

- [x] Write failing tests for signed/public URL normalization, deterministic prefix-safe IDs, PNG/JPEG/WebP integrity, and retry rules.
- [x] Run `node --test scripts/cloudinary/core.test.mjs` and confirm missing-module or missing-export failure.
- [x] Implement the minimum core functions.
- [x] Re-run the test file and confirm it passes.

### Task 2: Inventory and manifest generation

**Files:**
- Create: `scripts/cloudinary/inventory.test.mjs`
- Create: `scripts/cloudinary/inventory.mjs`
- Create: `scripts/cloudinary/manifest.mjs`

**Interfaces:**
- Consumes core normalization, hashing, and metadata functions.
- Produces `collectSupabaseReferences`, `buildManifest`, `verifyManifest`, and summary data.

- [x] Write failing tests for normalized-reference deduplication, content deduplication, exactly two supplemental objects, deterministic sorting, and tamper detection.
- [x] Run the inventory tests and confirm expected failure.
- [x] Implement REST inventory, bounded in-memory downloads, manifest generation, and digest verification.
- [x] Run core and inventory tests.

### Task 3: External state, resumable journal, and rollback planning

**Files:**
- Create: `scripts/cloudinary/state.test.mjs`
- Create: `scripts/cloudinary/state.mjs`
- Create: `scripts/cloudinary/rollback.mjs`

**Interfaces:**
- Produces external state-root resolution, repository-boundary rejection, atomic JSON persistence, journal resume behavior, and database forward/rollback operations.

- [x] Write failing tests for external-state enforcement, atomic journal idempotency, approved table/field restriction, and exact rollback values.
- [x] Run the state tests and confirm expected failure.
- [x] Implement state and rollback modules.
- [x] Re-run all tests.

### Task 4: Cloudinary read-only audit and guarded migration

**Files:**
- Create: `scripts/cloudinary/cloudinary.test.mjs`
- Create: `scripts/cloudinary/cloudinary.mjs`
- Create: `scripts/cloudinary/migrate.mjs`

**Interfaces:**
- Produces account usage/namespace audit, signed uploads, collision verification, execution gating, and resumable migration orchestration.

- [x] Write failing tests proving dry-run makes zero uploads, execution needs exact confirmation, matching existing assets are idempotent, collisions stop, and transient errors retry.
- [x] Run the Cloudinary tests and confirm expected failure.
- [x] Implement read-only API calls and guarded migration.
- [x] Re-run all tests.

### Task 5: CLI and runbook

**Files:**
- Create: `scripts/cloudinary-migration.mjs`
- Create: `docs/cloudinary-migration-runbook.md`

**Interfaces:**
- Consumes all migration modules.
- Produces the operator commands and documented execution/rollback process.

- [x] Write a failing CLI dry-run safety test.
- [x] Implement argument parsing and the five commands.
- [x] Document credentials, dry-run, approval gate, Cloudinary delivery syntax, Unsplash follow-up, future admin workflow, and rollback.
- [x] Run the full Node test suite.

### Task 6: Live dry-run verification

**Files:**
- Runtime outputs outside repository only.

**Interfaces:**
- Produces a 101-object manifest and sanitized summary without external mutations.

- [x] Run `node scripts/cloudinary-migration.mjs inventory`.
- [x] Run `node scripts/cloudinary-migration.mjs verify`.
- [x] Run `node scripts/cloudinary-migration.mjs audit-cloudinary` and record missing configuration without failure if credentials are absent.
- [x] Run the full test suite again.
- [x] Confirm tracked production diff is empty and prior emergency-recovery files are untouched.

### Task 7: Phase 3 Cloudinary connection and capacity audit

**Files:**
- Modify: `scripts/cloudinary/cloudinary.test.mjs`
- Modify: `scripts/cloudinary/cloudinary.mjs`

**Interfaces:**
- Extends `auditCloudinary` with the read-only product-environment configuration returned by `GET /config?settings=true`.
- Leaves `.env.local` loading in the migration CLI, upload gating, application code, and external assets unchanged.

- [x] Write a failing test proving the audit reads `/usage`, `/config?settings=true`, and only the isolated `halfway-cafe/` namespace.
- [x] Run the focused test and confirm it fails because configuration is not yet requested.
- [x] Add the minimum read-only configuration request and return value.
- [x] Re-run the focused and full migration test suites.
- [x] Run the live read-only audit, rebuild and verify the 101-object manifest, and compare all planned public IDs with the audited namespace.
- [x] Report unsupported settings explicitly; never probe them with a transforming delivery request.
