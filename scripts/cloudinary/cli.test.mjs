import test from "node:test";
import assert from "node:assert/strict";

import * as migrationCli from "../cloudinary-migration.mjs";
import { buildManifest } from "./manifest.mjs";

const { parseCliArguments } = migrationCli;

function executionManifest({
  generatedAt = "2026-10-15T20:00:00.000Z",
  sourceSha256 = "1".repeat(64),
} = {}) {
  return buildManifest({
    sourceHost: "project.supabase.co",
    generatedAt,
    expectedSourceObjectCount: 1,
    objects: [
      {
        objectPath: "menu/item.png",
        sourceSha256,
        bytes: 10,
        metadata: {
          format: "png",
          mimeType: "image/png",
          width: 100,
          height: 50,
        },
        sourceModes: ["signed"],
        sourceUrlFingerprints: ["2".repeat(64)],
        references: [
          {
            table: "menu_items",
            rowId: "item-1",
            field: "image_url",
            label: "Item",
          },
        ],
      },
    ],
  });
}

test("defaults to inventory and never execution", () => {
  assert.deepEqual(parseCliArguments([]), {
    command: "inventory",
    execute: false,
    confirmation: null,
    onlyPublicId: null,
  });
  assert.deepEqual(parseCliArguments(["migrate"]), {
    command: "migrate",
    execute: false,
    confirmation: null,
    onlyPublicId: null,
  });
});

test("rejects execution flags outside the migrate command", () => {
  assert.throws(
    () =>
      parseCliArguments([
        "inventory",
        "--execute",
        "--confirm-manifest",
        "a".repeat(64),
      ]),
    /only valid with migrate/i,
  );
});

test("requires explicit execution and an exact-looking manifest digest", () => {
  assert.throws(
    () => parseCliArguments(["migrate", "--execute"]),
    /confirm-manifest/i,
  );
  assert.throws(
    () =>
      parseCliArguments([
        "migrate",
        "--execute",
        "--confirm-manifest",
        "short",
      ]),
    /64-character/i,
  );
  assert.deepEqual(
    parseCliArguments([
      "migrate",
      "--execute",
      "--confirm-manifest",
      "a".repeat(64),
    ]),
    {
      command: "migrate",
      execute: true,
      confirmation: "a".repeat(64),
      onlyPublicId: null,
    },
  );
});

test("accepts one canonical pilot public ID only for migrate", () => {
  const publicId = "halfway-cafe/burgers/cheeseburger--0c6de1aafcd2";
  assert.deepEqual(
    parseCliArguments(["migrate", "--only-public-id", publicId]),
    {
      command: "migrate",
      execute: false,
      confirmation: null,
      onlyPublicId: publicId,
    },
  );
  assert.throws(
    () => parseCliArguments(["inventory", "--only-public-id", publicId]),
    /only valid with migrate/i,
  );
  assert.throws(
    () => parseCliArguments(["migrate", "--only-public-id", "other/item"]),
    /halfway-cafe/i,
  );
  assert.throws(
    () =>
      parseCliArguments([
        "migrate",
        "--only-public-id",
        publicId,
        "--only-public-id",
        "halfway-cafe/menu/other--aaaaaaaaaaaa",
      ]),
    /exactly one/i,
  );
});

test("rejects unknown commands and flags", () => {
  assert.throws(() => parseCliArguments(["destroy"]), /unknown command/i);
  assert.throws(() => parseCliArguments(["inventory", "--force"]), /unknown flag/i);
});

test("accepts plan-delivery only as a non-executing command", () => {
  assert.deepEqual(parseCliArguments(["plan-delivery"]), {
    command: "plan-delivery",
    execute: false,
    confirmation: null,
    onlyPublicId: null,
  });
  assert.throws(
    () => parseCliArguments(["plan-delivery", "--execute"]),
    /only valid with migrate/i,
  );
});

test("bulk execution retains the exact reviewed manifest after live source verification", () => {
  const bindReviewedManifestForExecution =
    migrationCli.bindReviewedManifestForExecution;
  assert.equal(
    typeof bindReviewedManifestForExecution,
    "function",
    "bulk execution must expose its reviewed-manifest gate",
  );

  const reviewedManifest = executionManifest();
  const liveInventory = {
    manifest: executionManifest({ generatedAt: "2026-10-16T10:00:00.000Z" }),
    sourceBuffersByObject: new Map([["menu/item.png", Buffer.alloc(10)]]),
  };
  const result = bindReviewedManifestForExecution({
    reviewedManifest,
    liveInventory,
    confirmation: reviewedManifest.manifestSha256,
  });

  assert.equal(result.manifest, reviewedManifest);
  assert.equal(result.sourceBuffersByObject, liveInventory.sourceBuffersByObject);
  assert.throws(
    () =>
      bindReviewedManifestForExecution({
        reviewedManifest,
        liveInventory,
        confirmation: "a".repeat(64),
      }),
    /confirmation.*reviewed manifest/i,
  );
  assert.throws(
    () =>
      bindReviewedManifestForExecution({
        reviewedManifest,
        liveInventory: {
          ...liveInventory,
          manifest: executionManifest({ sourceSha256: "3".repeat(64) }),
        },
        confirmation: reviewedManifest.manifestSha256,
      }),
    /live inventory.*reviewed manifest/i,
  );
});
