import test from "node:test";
import assert from "node:assert/strict";

import {
  auditCloudinary,
  buildUploadParameters,
  getCloudinaryConfig,
  resourceMatchesSource,
} from "./cloudinary.mjs";
import { runMigration } from "./migrate.mjs";
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
        width: 100,
        height: 80,
        sourceModes: ["signed"],
        sourceUrlFingerprints: ["b".repeat(64)],
        publicId: "halfway-cafe/menu/item--aaaaaaaaaaaa",
        references: [
          { table: "menu_items", rowId: "1", field: "image_url", label: "Item" },
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

test("reports missing Cloudinary configuration without making a request", async () => {
  let requests = 0;
  const result = await auditCloudinary({
    env: {},
    fetchImpl: async () => {
      requests += 1;
      throw new Error("must not run");
    },
  });

  assert.equal(result.available, false);
  assert.deepEqual(result.missing, [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ]);
  assert.equal(requests, 0);
});

test("configuration result never exposes the API secret", () => {
  const result = getCloudinaryConfig({
    CLOUDINARY_CLOUD_NAME: "shared-cloud",
    CLOUDINARY_API_KEY: "key",
    CLOUDINARY_API_SECRET: "top-secret",
  });

  assert.equal(result.available, true);
  assert.equal(result.config.apiSecret, "top-secret");
  assert.deepEqual(result.report, {
    available: true,
    cloudName: "shared-cloud",
    apiKeyConfigured: true,
    apiSecretConfigured: true,
  });
  assert.equal(JSON.stringify(result.report).includes("top-secret"), false);
});

test("read-only audit retrieves usage, product configuration, and only the isolated namespace", async () => {
  const requestedPaths = [];
  const result = await auditCloudinary({
    env: {
      CLOUDINARY_CLOUD_NAME: "shared-cloud",
      CLOUDINARY_API_KEY: "key",
      CLOUDINARY_API_SECRET: "top-secret",
    },
    fetchImpl: async (url, options) => {
      assert.equal(options.headers.Authorization.startsWith("Basic "), true);
      const parsed = new URL(url);
      requestedPaths.push(`${parsed.pathname}${parsed.search}`);

      if (parsed.pathname.endsWith("/usage")) {
        return new Response(
          JSON.stringify({
            plan: "Free",
            credits: { usage: 1, limit: 25, used_percent: 4 },
          }),
          { status: 200 },
        );
      }
      if (parsed.pathname.endsWith("/config")) {
        return new Response(
          JSON.stringify({
            cloud_name: "shared-cloud",
            settings: { folder_mode: "dynamic" },
          }),
          { status: 200 },
        );
      }
      if (parsed.pathname.endsWith("/resources/image/upload")) {
        assert.equal(parsed.searchParams.get("prefix"), "halfway-cafe/");
        return new Response(JSON.stringify({ resources: [] }), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    },
  });

  assert.deepEqual(requestedPaths, [
    "/v1_1/shared-cloud/usage",
    "/v1_1/shared-cloud/config?settings=true",
    "/v1_1/shared-cloud/resources/image/upload?prefix=halfway-cafe%2F&max_results=500&context=true",
  ]);
  assert.deepEqual(result.productEnvironment, {
    cloudName: "shared-cloud",
    folderMode: "dynamic",
  });
  assert.equal(result.namespace.assetCount, 0);
  assert.equal(JSON.stringify(result).includes("top-secret"), false);
});

test("upload parameters enforce prefix isolation and no overwrite", () => {
  const parameters = buildUploadParameters({
    publicId: "halfway-cafe/menu/item--aaaaaaaaaaaa",
    sourceSha256: "a".repeat(64),
    objectPath: "menu/item.png",
    timestamp: 1234,
  });
  assert.equal(parameters.overwrite, "false");
  assert.equal(parameters.unique_filename, "false");
  assert.equal(parameters.public_id, "halfway-cafe/menu/item--aaaaaaaaaaaa");
  assert.match(parameters.context, /source_sha256=/);
  assert.equal(parameters.context.includes("token="), false);
  assert.throws(
    () =>
      buildUploadParameters({
        publicId: "herb-and-goods/item",
        sourceSha256: "a".repeat(64),
        objectPath: "menu/item.png",
        timestamp: 1234,
      }),
    /prefix/i,
  );
});

test("recognizes only an existing Cloudinary asset with matching source identity", () => {
  const object = manifest().objects[0];
  const matching = {
    public_id: object.publicId,
    bytes: object.bytes,
    width: object.width,
    height: object.height,
    format: object.format,
    context: { custom: { source_sha256: object.sourceSha256 } },
  };
  assert.equal(resourceMatchesSource(matching, object), true);
  assert.equal(
    resourceMatchesSource(
      {
        ...matching,
        context: { custom: { source_sha256: "f".repeat(64) } },
      },
      object,
    ),
    false,
  );
});

test("dry-run migration never invokes upload", async () => {
  let uploads = 0;
  const result = await runMigration({
    manifest: manifest(),
    execute: false,
    uploadFn: async () => {
      uploads += 1;
    },
  });

  assert.equal(result.mode, "dry-run");
  assert.equal(result.plannedAssets, 1);
  assert.equal(result.uploadsAttempted, 0);
  assert.equal(uploads, 0);
});

test("execution requires the exact manifest confirmation", async () => {
  await assert.rejects(
    runMigration({
      manifest: manifest(),
      execute: true,
      confirmation: "wrong",
      cloudinaryConfig: { cloudName: "x", apiKey: "y", apiSecret: "z" },
      uploadFn: async () => ({}),
    }),
    /confirmation/i,
  );
});

test("matching existing assets and completed journals are idempotent", async () => {
  const value = manifest();
  const object = value.objects[0];
  let uploads = 0;
  const result = await runMigration({
    manifest: value,
    execute: true,
    confirmation: value.manifestSha256,
    cloudinaryConfig: { cloudName: "x", apiKey: "y", apiSecret: "z" },
    existingResources: [
      {
        public_id: object.publicId,
        bytes: object.bytes,
        width: object.width,
        height: object.height,
        format: object.format,
        version: 1234,
        context: { custom: { source_sha256: object.sourceSha256 } },
      },
    ],
    journal: {
      schemaVersion: 1,
      manifestSha256: value.manifestSha256,
      entries: {
        [object.publicId]: {
          publicId: object.publicId,
          sourceSha256: object.sourceSha256,
          status: "verified",
        },
      },
    },
    uploadFn: async () => {
      uploads += 1;
    },
  });

  assert.equal(result.skippedVerified, 1);
  assert.equal(result.uploadsAttempted, 0);
  assert.equal(uploads, 0);
});

test("an existing mismatched public ID is a hard collision", async () => {
  const value = manifest();
  const object = value.objects[0];
  await assert.rejects(
    runMigration({
      manifest: value,
      execute: true,
      confirmation: value.manifestSha256,
      cloudinaryConfig: { cloudName: "x", apiKey: "y", apiSecret: "z" },
      existingResources: [
        {
          public_id: object.publicId,
          bytes: object.bytes,
          width: object.width,
          height: object.height,
          format: object.format,
          context: { custom: { source_sha256: "f".repeat(64) } },
        },
      ],
      uploadFn: async () => ({}),
    }),
    /collision/i,
  );
});

test("transient upload failures retry and checkpoint the verified result", async () => {
  const value = manifest();
  const object = value.objects[0];
  let attempts = 0;
  const checkpoints = [];
  const result = await runMigration({
    manifest: value,
    execute: true,
    confirmation: value.manifestSha256,
    cloudinaryConfig: { cloudName: "x", apiKey: "y", apiSecret: "z" },
    sourceBuffersByObject: new Map([[object.objectPath, Buffer.alloc(object.bytes)]]),
    uploadFn: async () => {
      attempts += 1;
      if (attempts < 3) {
        const error = new Error("temporary");
        error.status = 503;
        throw error;
      }
      return {
        public_id: object.publicId,
        bytes: object.bytes,
        width: object.width,
        height: object.height,
        format: object.format,
        version: 1234,
        context: { custom: { source_sha256: object.sourceSha256 } },
      };
    },
    retryOptions: { sleep: async () => {}, random: () => 0 },
    onCheckpoint: async (journal) => checkpoints.push(structuredClone(journal)),
  });

  assert.equal(attempts, 3);
  assert.equal(result.uploaded, 1);
  assert.equal(checkpoints.length, 1);
  assert.equal(
    checkpoints[0].entries[object.publicId].status,
    "verified",
  );
});

test("single-asset mode validates the full manifest but uploads exactly the selected asset", async () => {
  const value = manifest();
  const first = value.objects[0];
  const second = {
    ...first,
    objectPath: "menu/second.png",
    sourceSha256: "c".repeat(64),
    sourceUrlFingerprints: ["d".repeat(64)],
    publicId: "halfway-cafe/menu/second--cccccccccccc",
    references: [
      { table: "menu_items", rowId: "2", field: "image_url", label: "Second" },
    ],
  };
  value.objects.push(second);
  value.expectedSourceObjectCount = 2;
  value.summary = {
    ...value.summary,
    sourceObjects: 2,
    destinationAssets: 2,
    databaseReferences: 2,
    totalBytes: 50,
    formats: { png: 2 },
  };
  value.manifestSha256 = computeManifestDigest(value);
  const uploadedPublicIds = [];

  const result = await runMigration({
    manifest: value,
    execute: true,
    confirmation: value.manifestSha256,
    onlyPublicId: second.publicId,
    requireNewUpload: true,
    cloudinaryConfig: { cloudName: "x", apiKey: "y", apiSecret: "z" },
    sourceBuffersByObject: new Map([[second.objectPath, Buffer.alloc(second.bytes)]]),
    uploadFn: async ({ object }) => {
      uploadedPublicIds.push(object.publicId);
      return {
        public_id: object.publicId,
        asset_id: "pilot-asset-id",
        bytes: object.bytes,
        width: object.width,
        height: object.height,
        format: object.format,
        version: 1234,
        context: { custom: { source_sha256: object.sourceSha256 } },
      };
    },
  });

  assert.equal(result.manifestAssets, 2);
  assert.equal(result.plannedAssets, 1);
  assert.equal(result.uploaded, 1);
  assert.deepEqual(uploadedPublicIds, [second.publicId]);
  assert.equal(result.journal.entries[first.publicId], undefined);
  assert.equal(result.journal.entries[second.publicId].assetId, "pilot-asset-id");
});

test("single-asset mode rejects unknown selectors and pre-existing pilot assets", async () => {
  const value = manifest();
  const object = value.objects[0];
  const base = {
    manifest: value,
    execute: true,
    confirmation: value.manifestSha256,
    requireNewUpload: true,
    cloudinaryConfig: { cloudName: "x", apiKey: "y", apiSecret: "z" },
  };
  await assert.rejects(
    runMigration({
      ...base,
      onlyPublicId: "halfway-cafe/menu/missing--bbbbbbbbbbbb",
    }),
    /not present/i,
  );
  await assert.rejects(
    runMigration({
      ...base,
      onlyPublicId: object.publicId,
      existingResources: [
        {
          public_id: object.publicId,
          bytes: object.bytes,
          width: object.width,
          height: object.height,
          format: object.format,
          version: 1234,
          context: { custom: { source_sha256: object.sourceSha256 } },
        },
      ],
    }),
    /already exists/i,
  );
});
