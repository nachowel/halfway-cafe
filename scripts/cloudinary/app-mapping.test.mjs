import test from "node:test";
import assert from "node:assert/strict";

import { buildApplicationMapping } from "./app-mapping.mjs";
import { computeManifestDigest } from "./manifest.mjs";

function fixture(count = 101) {
  const objects = Array.from({ length: count }, (_, index) => {
    const digest = index.toString(16).padStart(64, "0");
    return {
      objectPath: `menu/item-${index}.png`,
      sourceSha256: digest,
      bytes: 100 + index,
      format: "png",
      mimeType: "image/png",
      width: 1200,
      height: 900,
      sourceModes: ["signed"],
      sourceUrlFingerprints: ["f".repeat(64)],
      publicId: `halfway-cafe/menu/item-${index}--${digest.slice(0, 12)}`,
      references: [{ table: "menu_items", rowId: `${index}`, field: "image_url", label: `Item ${index}` }],
    };
  });
  const manifest = {
    schemaVersion: 1,
    sourceHost: "project.supabase.co",
    expectedSourceObjectCount: count,
    objects,
    summary: {
      sourceObjects: count,
      destinationAssets: count,
      databaseReferences: count,
      codeReferences: 0,
      referenceDuplicateObjects: 0,
      duplicateReferences: 0,
      contentDuplicateGroups: 0,
      contentDuplicateObjects: 0,
      totalBytes: objects.reduce((sum, object) => sum + object.bytes, 0),
      formats: { png: count },
    },
  };
  manifest.manifestSha256 = computeManifestDigest(manifest);
  const journal = {
    schemaVersion: 1,
    manifestSha256: manifest.manifestSha256,
    entries: Object.fromEntries(objects.map((object, index) => [
      object.publicId,
      {
        publicId: object.publicId,
        sourceSha256: object.sourceSha256,
        status: "verified",
        assetId: `asset-${index}`,
        version: 1700000000 + index,
      },
    ])),
  };
  return { manifest, journal };
}

test("creates a deterministic secret-free mapping from all 101 verified assets", () => {
  const { manifest, journal } = fixture();
  const mapping = buildApplicationMapping({ manifest, journal });

  assert.equal(mapping.schemaVersion, 1);
  assert.equal(mapping.manifestSha256, manifest.manifestSha256);
  assert.equal(mapping.sourceHost, "project.supabase.co");
  assert.equal(mapping.assets.length, 101);
  assert.deepEqual(Object.keys(mapping.assets[0]), [
    "objectPath", "publicId", "version", "format", "width", "height",
  ]);
  assert.equal(JSON.stringify(mapping).includes("asset-0"), false);
  assert.equal(JSON.stringify(mapping).includes("supabase.co/storage"), false);
  assert.deepEqual(
    buildApplicationMapping({ manifest, journal }),
    mapping,
  );
});

test("rejects incomplete, unverified, mismatched, unversioned, extra, and unsafe journal state", () => {
  const { manifest, journal } = fixture();
  const first = manifest.objects[0];
  const build = (value) => buildApplicationMapping({ manifest, journal: value });

  const missing = structuredClone(journal);
  delete missing.entries[first.publicId];
  assert.throws(() => build(missing), /missing/i);

  const unverified = structuredClone(journal);
  unverified.entries[first.publicId].status = "uploaded";
  assert.throws(() => build(unverified), /verified/i);

  const mismatched = structuredClone(journal);
  mismatched.entries[first.publicId].sourceSha256 = "a".repeat(64);
  assert.throws(() => build(mismatched), /source/i);

  const unversioned = structuredClone(journal);
  unversioned.entries[first.publicId].version = null;
  assert.throws(() => build(unversioned), /version/i);

  const extra = structuredClone(journal);
  extra.entries["halfway-cafe/menu/extra--aaaaaaaaaaaa"] = {
    publicId: "halfway-cafe/menu/extra--aaaaaaaaaaaa",
    sourceSha256: "a".repeat(64),
    status: "verified",
    version: 1700009999,
  };
  assert.throws(() => build(extra), /extra/i);

  const unsafeManifest = structuredClone(manifest);
  unsafeManifest.objects[0].publicId = "other-namespace/menu/item";
  unsafeManifest.manifestSha256 = computeManifestDigest(unsafeManifest);
  const unsafeJournal = structuredClone(journal);
  unsafeJournal.manifestSha256 = unsafeManifest.manifestSha256;
  unsafeJournal.entries["other-namespace/menu/item"] = {
    ...unsafeJournal.entries[first.publicId],
    publicId: "other-namespace/menu/item",
  };
  delete unsafeJournal.entries[first.publicId];
  assert.throws(
    () => buildApplicationMapping({ manifest: unsafeManifest, journal: unsafeJournal }),
    /namespace|prefix/i,
  );
});

test("rejects a journal tied to any other manifest digest", () => {
  const { manifest, journal } = fixture();
  journal.manifestSha256 = "b".repeat(64);
  assert.throws(
    () => buildApplicationMapping({ manifest, journal }),
    /manifest/i,
  );
});
