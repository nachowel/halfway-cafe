# Cloudinary Single-Image Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate the one authorized Halfway Cafe Cloudinary pilot asset end to end without uploading any additional asset or changing the approved 101-object manifest.

**Architecture:** Use the existing external manifest, private source snapshot, journal, Cloudinary namespace audit, delivery signer, and pilot verifier. Preflight evidence shows the authorized one-asset pilot is already present and journaled, so execution is verification-only; the existing `requireNewUpload` collision guard must prevent a second upload.

**Tech Stack:** Node.js built-in test runner, dependency-free migration CLI, Cloudinary Admin API and signed delivery CDN, PowerShell SHA-256 verification.

## Global Constraints

- Preserve the existing 101-object manifest and both its embedded digest and file SHA-256.
- Keep the existing planned public IDs unchanged.
- Retain both explicit execution gates; do not weaken collision or namespace checks.
- Keep `overwrite=false`; never delete or overwrite an asset.
- Do not upload more than the one already-recorded pilot asset.
- Do not modify Supabase, database records, production application code, Cloudinary settings, or Herb & Goods assets.
- Do not commit, push, or deploy.
- Stop immediately on any validation failure.

---

### Task 1: Freeze and verify the approved manifest

**Files:**
- Read: `C:\Users\nacho\AppData\Local\HalfwayCafe\cloudinary-migration\manifest.json`
- Read: `C:\Users\nacho\AppData\Local\HalfwayCafe\cloudinary-migration\source-snapshot.private.json`

**Interfaces:**
- Consumes: existing external migration state.
- Produces: manifest embedded digest, file digest, object count, and selected object identity for later checks.

- [ ] **Step 1: Run offline manifest verification**

```powershell
node scripts/cloudinary-migration.mjs verify
```

Expected: `verified: true`, 101 source objects, and embedded digest `ea214f628cdf683990015e595a4946af0333c6a7acc7a8ba8512e79bb94a8cb7`.

- [ ] **Step 2: Record the manifest file SHA-256 and metadata**

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "$env:LOCALAPPDATA\HalfwayCafe\cloudinary-migration\manifest.json"
```

Expected file digest: `4f7d295188ca1685b916023c24bcc4fbc5989b543fdae2aad8186517b8529727`.

- [ ] **Step 3: Select the already-journaled representative menu image**

Use `halfway-cafe/burgers/cheeseburger--0c6de1aafcd2`, referenced by `menu_items.image_url` with label `Cheese Burger`.

### Task 2: Verify safeguards and external identity

**Files:**
- Read: `scripts/cloudinary-migration.mjs`
- Read: `scripts/cloudinary/migrate.mjs`
- Read: `scripts/cloudinary/cloudinary.mjs`
- Test: `scripts/cloudinary/*.test.mjs`

**Interfaces:**
- Consumes: manifest digest and selected public ID from Task 1.
- Produces: passing safeguard tests and one matching Cloudinary Admin API resource.

- [ ] **Step 1: Run the complete migration-tool test suite**

```powershell
node --test scripts/cloudinary/*.test.mjs
```

Expected: zero failed tests.

- [ ] **Step 2: Audit only the `halfway-cafe/` namespace**

```powershell
node scripts/cloudinary-migration.mjs audit-cloudinary
```

Expected: exactly one resource in the namespace; no settings mutation.

- [ ] **Step 3: Verify the resource against the manifest and journal**

Expected exact values: asset ID `cde31bc8a09f73090920b1d14b427902`, version `1792101244`, PNG, 1,050,324 bytes, 1184x896, and source SHA-256 `0c6de1aafcd2f9388d2aa5d7cb7444daf05508969215adf840fad674e7e57a8f`.

- [ ] **Step 4: Exercise both explicit gates and the new-upload collision stop**

```powershell
node scripts/cloudinary-migration.mjs migrate --only-public-id halfway-cafe/burgers/cheeseburger--0c6de1aafcd2 --execute --confirm-manifest ea214f628cdf683990015e595a4946af0333c6a7acc7a8ba8512e79bb94a8cb7
```

Expected: the command refuses with `Selected pilot asset already exists`; no upload request is attempted and the journal remains unchanged.

### Task 3: Verify signed direct delivery

**Files:**
- Read: `scripts/cloudinary/delivery.mjs`
- Read: `scripts/cloudinary/pilot.mjs`
- Read: `C:\Users\nacho\AppData\Local\HalfwayCafe\cloudinary-migration\journal.private.json`

**Interfaces:**
- Consumes: selected manifest object, Cloudinary version, cloud name, and server-only API secret.
- Produces: three SHA-256-signed direct Cloudinary delivery results without printing secrets or signatures.

- [ ] **Step 1: Re-download and verify the selected Supabase source**

Call `loadVerifiedPilotSource` and require exact SHA-256, byte size, format, width, height, URL fingerprint, and object-path matches.

- [ ] **Step 2: Generate signed delivery URLs**

Call `buildSignedCloudinaryDeliveryUrl` for widths 256, 640, and 1080. The exact signed path is `c_limit,w_<width>/f_auto/q_auto/v1792101244/halfway-cafe/burgers/cheeseburger--0c6de1aafcd2.png`, signed with the documented SHA-256/base64url/first-eight algorithm.

- [ ] **Step 3: Request and decode all three variants**

Call `verifyPilotDelivery` with an AVIF/WebP-capable `Accept` header. Require HTTP 200; dimensions 256x194, 640x484, and 1080x817; a decodable supported image; matching content type; and direct `res.cloudinary.com` URLs with no `/_next/image` path.

### Task 4: Prove state preservation and issue recommendation

**Files:**
- Read: `C:\Users\nacho\AppData\Local\HalfwayCafe\cloudinary-migration\manifest.json`
- Read: `C:\Users\nacho\AppData\Local\HalfwayCafe\cloudinary-migration\journal.private.json`
- Read: repository Git status.

**Interfaces:**
- Consumes: all results from Tasks 1-3.
- Produces: GO/NO-GO recommendation with exactly 100 manifest assets remaining.

- [ ] **Step 1: Re-run manifest verification and file hashing**

Expected: both manifest digests and the 101-object count are unchanged.

- [ ] **Step 2: Verify journal state**

Expected: exactly one `verified` entry matching the selected public ID, source SHA-256, asset ID, and version.

- [ ] **Step 3: Re-audit the namespace**

Expected: exactly one `halfway-cafe/` asset, so 100 planned assets remain.

- [ ] **Step 4: Confirm repository boundaries**

Run `git status --short` and confirm no Supabase, database, production application, deployment, or Cloudinary-setting changes were made. Do not commit, push, or deploy.

- [ ] **Step 5: Report and stop**

Return the selected asset, source and Cloudinary verification, HTTP statuses, signed-delivery outcomes, journal state, and GO/NO-GO recommendation. Stop before bulk migration.
