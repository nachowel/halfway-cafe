# Cloudinary Signed Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dependency-free signed Cloudinary responsive-delivery planning that is compatible with Strict Transformations and cannot run before all 101 uploads are verified.

**Architecture:** A focused delivery module constructs and signs canonical Cloudinary paths and builds a private, integrity-checked delivery plan. The existing CLI gains a `plan-delivery` command that reads only external migration state and refuses incomplete or mismatched journals.

**Tech Stack:** Node.js 18+ built-ins, `node:crypto`, native ES modules, `node:test`.

## Global Constraints

- Do not upload images or modify Cloudinary account settings or assets.
- Do not modify Supabase, database records, production application code, or emergency-recovery files.
- Keep API secrets out of client bundles, browser requests other than public URL signatures, public manifests, logs, and repository files.
- Preserve the exact 101-object manifest, deterministic IDs, upload safeguards, database rollback, and `halfway-cafe/` isolation.
- Do not commit, push, or deploy.

---

### Task 1: Canonical delivery signing and responsive candidates

**Files:**
- Create: `scripts/cloudinary/delivery.test.mjs`
- Create: `scripts/cloudinary/delivery.mjs`

**Interfaces:**
- Consumes `RESPONSIVE_WIDTHS`, `assertCloudinaryPublicId`, `canonicalStringify`, and `sha256` from `core.mjs`.
- Produces `signCloudinaryDeliveryPath`, `verifyCloudinaryDeliverySignature`, `responsiveWidthsForIntrinsicWidth`, `buildSignedCloudinaryDeliveryUrl`, `buildSignedDeliveryPlan`, and `verifySignedDeliveryPlan`.

- [x] **Step 1: Write failing tests for the official SHA-1 vector and SHA-256 URL-safe encoding.**
- [x] **Step 2: Run `node --test scripts/cloudinary/delivery.test.mjs` and confirm the missing-module failure.**
- [x] **Step 3: Implement canonical path signing and constant-time verification using Node crypto.**
- [x] **Step 4: Run the focused tests and confirm the signature tests pass.**
- [x] **Step 5: Add failing tests proving width, transformation, version, public ID, and extension tampering invalidates a signature.**
- [x] **Step 6: Implement fixed transformation construction and signed URL generation.**
- [x] **Step 7: Add failing tests for the capped responsive lattice, complete verified journal requirement, secret exclusion, and plan tamper detection.**
- [x] **Step 8: Implement delivery-plan construction and verification, then run the focused tests.**

### Task 2: Private post-upload CLI command

**Files:**
- Modify: `scripts/cloudinary/cli.test.mjs`
- Modify: `scripts/cloudinary-migration.mjs`

**Interfaces:**
- Consumes the verified manifest, verified upload journal, Cloudinary cloud name and API secret, and delivery-plan functions.
- Produces an external `delivery-plan.private.json` and a sanitized summary.

- [x] **Step 1: Add a failing CLI parser test for `plan-delivery` and execution-flag rejection.**
- [x] **Step 2: Run the CLI tests and confirm `plan-delivery` is rejected as unknown.**
- [x] **Step 3: Add the command, external state path, complete-journal checks, private write, and sanitized output.**
- [x] **Step 4: Run the CLI and delivery tests.**
- [x] **Step 5: Run the live command before uploads and confirm it fails without producing a delivery plan.**

### Task 3: Runbook and final verification

**Files:**
- Modify: `docs/cloudinary-migration-runbook.md`

**Interfaces:**
- Documents Strict Transformation compatibility, secret handling, command ordering, and risks.

- [x] **Step 1: Document signed delivery syntax, server-only signing, `plan-delivery`, and the disabled-backup rollback dependency.**
- [x] **Step 2: Run all migration tests and migration-script lint.**
- [x] **Step 3: Re-run manifest verification and dry-run migration, confirming 101 objects and zero uploads.**
- [x] **Step 4: Confirm no production, Supabase, database, Cloudinary, account-setting, emergency-recovery, commit, push, or deployment change occurred.**
