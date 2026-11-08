import test from "node:test";
import assert from "node:assert/strict";

import {
  SUPPLEMENTAL_OBJECTS,
  addSupplementalReferences,
  deduplicateReferences,
} from "./inventory.mjs";
import {
  buildManifest,
  verifyManifest,
} from "./manifest.mjs";
import { inspectImage, sha256 } from "./core.mjs";

function png(width, height, marker = 0) {
  const buffer = Buffer.alloc(25);
  Buffer.from("89504e470d0a1a0a", "hex").copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  buffer[24] = marker;
  return buffer;
}

function reference(sourceUrl, rowId) {
  return {
    table: "menu_items",
    rowId,
    field: "image_url",
    label: rowId,
    sourceUrl,
  };
}

test("deduplicates signed URL variants by normalized Supabase object", () => {
  const references = [
    reference(
      "https://project.supabase.co/storage/v1/object/sign/menu/a.png?token=one",
      "1",
    ),
    reference(
      "https://project.supabase.co/storage/v1/object/sign/menu/a.png?token=two",
      "2",
    ),
  ];

  const groups = deduplicateReferences(references, "project.supabase.co");

  assert.equal(groups.size, 1);
  const group = groups.get("menu/a.png");
  assert.equal(group.references.length, 2);
  assert.equal(group.sourceUrls.length, 2);
  assert.equal(group.sourceUrlFingerprints.length, 2);
});

test("adds exactly the two approved code-only Supabase objects", () => {
  assert.deepEqual(
    SUPPLEMENTAL_OBJECTS.map((item) => item.objectPath),
    ["Hero/icon-logo.png", "Hero/breakfast-hero.webp"],
  );

  const references = addSupplementalReferences(
    [],
    "https://project.supabase.co",
  );
  assert.equal(references.length, 2);
  assert.ok(references.every((item) => item.table === "code"));
  assert.ok(references.every((item) => !item.sourceUrl.includes("token=")));
});

test("content-identical source objects share one deterministic destination", () => {
  const bytes = png(100, 80, 1);
  const digest = sha256(bytes);
  const manifest = buildManifest({
    sourceHost: "project.supabase.co",
    generatedAt: "2026-10-15T12:00:00.000Z",
    objects: [
      {
        objectPath: "z-bucket/copy.png",
        bytes: bytes.length,
        sourceSha256: digest,
        metadata: inspectImage(bytes),
        sourceModes: ["signed"],
        sourceUrlFingerprints: ["b".repeat(64)],
        references: [{ table: "menu_items", rowId: "2", field: "image_url" }],
      },
      {
        objectPath: "a-bucket/original.png",
        bytes: bytes.length,
        sourceSha256: digest,
        metadata: inspectImage(bytes),
        sourceModes: ["signed"],
        sourceUrlFingerprints: ["a".repeat(64)],
        references: [{ table: "categories", rowId: "1", field: "image_url" }],
      },
    ],
    expectedSourceObjectCount: 2,
  });

  assert.equal(manifest.summary.sourceObjects, 2);
  assert.equal(manifest.summary.destinationAssets, 1);
  assert.equal(manifest.summary.contentDuplicateGroups, 1);
  assert.equal(manifest.objects[0].objectPath, "a-bucket/original.png");
  assert.equal(manifest.objects[0].publicId, manifest.objects[1].publicId);
  assert.match(manifest.objects[0].publicId, /^halfway-cafe\/a-bucket\/original--/);
});

test("manifest ordering and digest are deterministic", () => {
  const firstBytes = png(10, 20, 1);
  const secondBytes = png(30, 40, 2);
  const objects = [
    {
      objectPath: "b/two.png",
      bytes: secondBytes.length,
      sourceSha256: sha256(secondBytes),
      metadata: inspectImage(secondBytes),
      sourceModes: ["signed"],
      sourceUrlFingerprints: ["2".repeat(64)],
      references: [{ table: "menu_items", rowId: "2", field: "image_url" }],
    },
    {
      objectPath: "a/one.png",
      bytes: firstBytes.length,
      sourceSha256: sha256(firstBytes),
      metadata: inspectImage(firstBytes),
      sourceModes: ["public"],
      sourceUrlFingerprints: ["1".repeat(64)],
      references: [{ table: "site_settings", rowId: "1", field: "value" }],
    },
  ];

  const left = buildManifest({
    sourceHost: "project.supabase.co",
    generatedAt: "2026-10-15T12:00:00.000Z",
    objects,
    expectedSourceObjectCount: 2,
  });
  const right = buildManifest({
    sourceHost: "project.supabase.co",
    generatedAt: "2026-10-16T12:00:00.000Z",
    objects: [...objects].reverse(),
    expectedSourceObjectCount: 2,
  });

  assert.deepEqual(left.objects, right.objects);
  assert.equal(left.manifestSha256, right.manifestSha256);
  assert.doesNotThrow(() => verifyManifest(left, { expectedSourceObjectCount: 2 }));
});

test("manifest verification detects tampering and unexpected object counts", () => {
  const bytes = png(10, 10, 3);
  const manifest = buildManifest({
    sourceHost: "project.supabase.co",
    objects: [
      {
        objectPath: "menu/item.png",
        bytes: bytes.length,
        sourceSha256: sha256(bytes),
        metadata: inspectImage(bytes),
        sourceModes: ["signed"],
        sourceUrlFingerprints: ["3".repeat(64)],
        references: [{ table: "menu_items", rowId: "3", field: "image_url" }],
      },
    ],
    expectedSourceObjectCount: 1,
  });

  const tampered = structuredClone(manifest);
  tampered.objects[0].bytes += 1;
  assert.throws(
    () => verifyManifest(tampered, { expectedSourceObjectCount: 1 }),
    /digest/i,
  );
  assert.throws(
    () => verifyManifest(manifest, { expectedSourceObjectCount: 2 }),
    /expected 2/i,
  );
});
