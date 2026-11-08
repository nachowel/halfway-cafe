import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSignedCloudinaryDeliveryUrl,
  buildSignedDeliveryPlan,
  responsiveWidthsForIntrinsicWidth,
  signCloudinaryDeliveryPath,
  verifyCloudinaryDeliverySignature,
  verifySignedDeliveryPlan,
} from "./delivery.mjs";
import { computeManifestDigest } from "./manifest.mjs";

function manifest() {
  const value = {
    schemaVersion: 1,
    sourceHost: "project.supabase.co",
    expectedSourceObjectCount: 1,
    objects: [
      {
        objectPath: "menu/item.png",
        sourceSha256: "a".repeat(64),
        bytes: 25,
        format: "png",
        mimeType: "image/png",
        width: 221,
        height: 180,
        sourceModes: ["signed"],
        sourceUrlFingerprints: ["b".repeat(64)],
        publicId: "halfway-cafe/menu/item--aaaaaaaaaaaa",
        references: [
          {
            table: "menu_items",
            rowId: "1",
            field: "image_url",
            label: "Item",
          },
        ],
      },
    ],
    summary: {
      sourceObjects: 1,
      destinationAssets: 1,
      databaseReferences: 1,
      codeReferences: 0,
      referenceDuplicateObjects: 0,
      duplicateReferences: 0,
      contentDuplicateGroups: 0,
      contentDuplicateObjects: 0,
      totalBytes: 25,
      formats: { png: 1 },
    },
  };
  value.manifestSha256 = computeManifestDigest(value);
  return value;
}

function verifiedJournal(value = manifest()) {
  const object = value.objects[0];
  return {
    schemaVersion: 1,
    manifestSha256: value.manifestSha256,
    entries: {
      [object.publicId]: {
        publicId: object.publicId,
        sourceSha256: object.sourceSha256,
        status: "verified",
        version: 1234,
      },
    },
  };
}

test("matches Cloudinary's published SHA-1 delivery signature vector", () => {
  assert.equal(
    signCloudinaryDeliveryPath({
      deliveryPath:
        "c_fill,w_300,h_250/e_grayscale/sample-authenticated.png",
      apiSecret: "abcd",
      algorithm: "sha1",
    }),
    "iDy_JeBq",
  );
});

test("uses URL-safe unpadded SHA-256 encoding for delivery signatures", () => {
  assert.equal(
    signCloudinaryDeliveryPath({
      deliveryPath:
        "c_limit,w_828/f_auto/q_auto/v1234/halfway-cafe/hero/hero1--a770d412c9c0.png",
      apiSecret: "test-secret",
    }),
    "1T99h5Wk",
  );
});

test("rejects signatures after any signed delivery component is modified", () => {
  const apiSecret = "test-secret";
  const deliveryPath =
    "c_limit,w_828/f_auto/q_auto/v1234/halfway-cafe/hero/hero1--a770d412c9c0.png";
  const signature = signCloudinaryDeliveryPath({ deliveryPath, apiSecret });

  assert.equal(
    verifyCloudinaryDeliverySignature({ deliveryPath, signature, apiSecret }),
    true,
  );
  for (const modified of [
    deliveryPath.replace("w_828", "w_640"),
    deliveryPath.replace("q_auto", "q_75"),
    deliveryPath.replace("v1234", "v1235"),
    deliveryPath.replace("hero1--a770d412c9c0", "hero2--a770d412c9c0"),
    deliveryPath.replace(".png", ".jpg"),
  ]) {
    assert.equal(
      verifyCloudinaryDeliverySignature({
        deliveryPath: modified,
        signature,
        apiSecret,
      }),
      false,
    );
  }
});

test("caps the finite responsive lattice at each intrinsic width", () => {
  assert.deepEqual(responsiveWidthsForIntrinsicWidth(221), [96, 192, 221]);
  assert.deepEqual(responsiveWidthsForIntrinsicWidth(1024), [
    96, 192, 256, 384, 640, 828, 1024,
  ]);
  assert.deepEqual(responsiveWidthsForIntrinsicWidth(80), [80]);
});

test("builds a canonical signed URL with visible f_auto and q_auto components", () => {
  assert.equal(
    buildSignedCloudinaryDeliveryUrl({
      cloudName: "shared-cloud",
      apiSecret: "test-secret",
      publicId: "halfway-cafe/hero/hero1--a770d412c9c0",
      version: 1234,
      format: "png",
      width: 828,
      intrinsicWidth: 1024,
    }),
    "https://res.cloudinary.com/shared-cloud/image/upload/s--1T99h5Wk--/c_limit,w_828/f_auto/q_auto/v1234/halfway-cafe/hero/hero1--a770d412c9c0.png",
  );
});

test("rejects public IDs that would require URL-encoding before signing", () => {
  assert.throws(
    () =>
      buildSignedCloudinaryDeliveryUrl({
        cloudName: "shared-cloud",
        apiSecret: "test-secret",
        publicId: "halfway-cafe/menu/item name--aaaaaaaaaaaa",
        version: 1234,
        format: "png",
        width: 192,
        intrinsicWidth: 221,
      }),
    /canonical public id/i,
  );
});

test("builds and verifies a secret-free plan only from a complete verified journal", () => {
  const value = manifest();
  const plan = buildSignedDeliveryPlan({
    manifest: value,
    journal: verifiedJournal(value),
    cloudName: "shared-cloud",
    apiSecret: "test-secret",
    generatedAt: "2026-10-15T12:00:00.000Z",
  });

  assert.equal(plan.objects.length, 1);
  assert.deepEqual(
    plan.objects[0].candidates.map((candidate) => candidate.width),
    [96, 192, 221],
  );
  assert.equal(plan.summary.objects, 1);
  assert.equal(plan.summary.candidates, 3);
  assert.equal(JSON.stringify(plan).includes("test-secret"), false);
  assert.doesNotThrow(() =>
    verifySignedDeliveryPlan(plan, {
      manifest: value,
      journal: verifiedJournal(value),
      apiSecret: "test-secret",
    }),
  );
});

test("refuses missing, unverified, mismatched, unversioned, or extra journal entries", () => {
  const value = manifest();
  const base = verifiedJournal(value);
  const build = (journal) =>
    buildSignedDeliveryPlan({
      manifest: value,
      journal,
      cloudName: "shared-cloud",
      apiSecret: "test-secret",
    });

  assert.throws(() => build({ ...base, entries: {} }), /missing/i);
  assert.throws(
    () =>
      build({
        ...base,
        entries: {
          ...base.entries,
          [value.objects[0].publicId]: {
            ...base.entries[value.objects[0].publicId],
            status: "uploaded",
          },
        },
      }),
    /verified/i,
  );
  assert.throws(
    () =>
      build({
        ...base,
        entries: {
          ...base.entries,
          [value.objects[0].publicId]: {
            ...base.entries[value.objects[0].publicId],
            sourceSha256: "f".repeat(64),
          },
        },
      }),
    /source/i,
  );
  assert.throws(
    () =>
      build({
        ...base,
        entries: {
          ...base.entries,
          [value.objects[0].publicId]: {
            ...base.entries[value.objects[0].publicId],
            version: null,
          },
        },
      }),
    /version/i,
  );
  assert.throws(
    () =>
      build({
        ...base,
        entries: {
          ...base.entries,
          "halfway-cafe/other/asset--bbbbbbbbbbbb": {
            publicId: "halfway-cafe/other/asset--bbbbbbbbbbbb",
            sourceSha256: "b".repeat(64),
            status: "verified",
            version: 1234,
          },
        },
      }),
    /extra/i,
  );
});

test("detects delivery-plan URL tampering", () => {
  const value = manifest();
  const journal = verifiedJournal(value);
  const plan = buildSignedDeliveryPlan({
    manifest: value,
    journal,
    cloudName: "shared-cloud",
    apiSecret: "test-secret",
  });
  const tampered = structuredClone(plan);
  tampered.objects[0].candidates[0].url = tampered.objects[0].candidates[0].url
    .replace("w_96", "w_192");

  assert.throws(
    () =>
      verifySignedDeliveryPlan(tampered, {
        manifest: value,
        journal,
        apiSecret: "test-secret",
      }),
    /digest|candidate|signature/i,
  );
});
