import assert from "node:assert/strict";
import { test } from "node:test";

import {
  executeImageUpload,
  ImageUploadIntegrityError,
  type ImageAssetRegistryRow,
  type RemoteImageAsset,
} from "./admin-image-upload-service.ts";
import type { NormalizedImage } from "./admin-image-processing.server.ts";

const image: NormalizedImage = {
  buffer: Buffer.from("verified-image-bytes"),
  byteSize: 20,
  format: "jpeg",
  mime: "image/jpeg",
  width: 1200,
  height: 800,
  sha256: "a".repeat(64),
  safeFilename: "cheese-burger.jpg",
};

function pendingRow(): ImageAssetRegistryRow {
  return {
    id: "b90a4b51-b10a-4f3e-b206-09d847bd133b",
    public_id: "halfway-cafe/admin/cheese-burger--11111111-1111-4111-8111-111111111111",
    asset_id: null,
    version: null,
    format: "jpeg",
    width: 1200,
    height: 800,
    byte_size: 20,
    source_sha256: "a".repeat(64),
    original_filename: "cheese-burger.jpg",
    mime_type: "image/jpeg",
    status: "pending",
  };
}

const remote: RemoteImageAsset = {
  publicId: "halfway-cafe/admin/cheese-burger--11111111-1111-4111-8111-111111111111",
  assetId: "cloudinary-asset-id",
  version: 456,
  format: "jpg",
  width: 1200,
  height: 800,
  bytes: 20,
  existing: false,
};

test("a verified image is uploaded once and finalized only after exact integrity checks", async () => {
  const calls: string[] = [];
  const diagnosticStages: string[] = [];
  const result = await executeImageUpload(
    { image, idempotencyKey: "22222222-2222-4222-8222-222222222222" },
    {
      randomUUID: () => "11111111-1111-4111-8111-111111111111",
      begin: async (input) => {
        calls.push(`begin:${input.publicId}:${input.sourceSha256}`);
        return pendingRow();
      },
      findRemote: async (publicId) => {
        calls.push(`find:${publicId}`);
        return null;
      },
      upload: async (buffer, publicId, filename) => {
        calls.push(`upload:${buffer.byteLength}:${publicId}:${filename}`);
        return remote;
      },
      finalize: async (id, verified) => {
        calls.push(`finalize:${id}:${verified.assetId}:${verified.version}`);
        return { ...pendingRow(), status: "ready", asset_id: verified.assetId, version: 456 };
      },
      fail: async () => {
        calls.push("fail");
      },
      diagnostics: {
        run: async (stage, operation) => {
          diagnosticStages.push(stage);
          return await operation();
        },
      },
    },
  );

  assert.equal(
    result.reference,
    "cloudinary/halfway-cafe/admin/cheese-burger--11111111-1111-4111-8111-111111111111",
  );
  assert.deepEqual(calls, [
    `begin:${remote.publicId}:${"a".repeat(64)}`,
    `find:${remote.publicId}`,
    `upload:20:${remote.publicId}:cheese-burger.jpg`,
    `finalize:b90a4b51-b10a-4f3e-b206-09d847bd133b:cloudinary-asset-id:456`,
  ]);
  assert.deepEqual(diagnosticStages, [
    "begin_image_asset",
    "existing_row_lookup",
    "cloudinary_find_remote",
    "cloudinary_upload",
    "integrity_verification",
    "supabase_finalization",
  ]);
});

test("service diagnostics identify the precise failing upload operation", async () => {
  const events: string[] = [];
  const providerFailure = new Error("private provider failure");

  await assert.rejects(
    () => executeImageUpload(
      { image, idempotencyKey: "22222222-2222-4222-8222-222222222222" },
      {
        randomUUID: () => "11111111-1111-4111-8111-111111111111",
        begin: async () => pendingRow(),
        findRemote: async () => { throw providerFailure; },
        upload: async () => remote,
        finalize: async () => pendingRow(),
        fail: async () => undefined,
        diagnostics: {
          run: async (stage, operation) => {
            events.push(`${stage}:started`);
            try {
              const value = await operation();
              events.push(`${stage}:completed`);
              return value;
            } catch (error) {
              events.push(`${stage}:failed`);
              throw error;
            }
          },
        },
      },
    ),
    (error) => error === providerFailure,
  );

  assert.deepEqual(events, [
    "begin_image_asset:started",
    "begin_image_asset:completed",
    "existing_row_lookup:started",
    "existing_row_lookup:completed",
    "cloudinary_find_remote:started",
    "cloudinary_find_remote:failed",
  ]);
});

test("incomplete finalized metadata is diagnosed at the Supabase finalization boundary", async () => {
  const events: string[] = [];

  await assert.rejects(
    () => executeImageUpload(
      { image, idempotencyKey: "22222222-2222-4222-8222-222222222222" },
      {
        randomUUID: () => "11111111-1111-4111-8111-111111111111",
        begin: async () => pendingRow(),
        findRemote: async () => remote,
        upload: async () => remote,
        finalize: async () => pendingRow(),
        fail: async () => undefined,
        diagnostics: {
          run: async (stage, operation) => {
            try {
              const value = await operation();
              events.push(`${stage}:completed`);
              return value;
            } catch (error) {
              events.push(`${stage}:failed`);
              throw error;
            }
          },
        },
      },
    ),
    ImageUploadIntegrityError,
  );

  assert.equal(events.at(-1), "supabase_finalization:failed");
});

test("a ready idempotent registry result never uploads again", async () => {
  let uploaded = false;
  const ready = { ...pendingRow(), status: "ready" as const, asset_id: "asset", version: 9 };
  const result = await executeImageUpload(
    { image, idempotencyKey: "22222222-2222-4222-8222-222222222222" },
    {
      randomUUID: () => "11111111-1111-4111-8111-111111111111",
      begin: async () => ready,
      findRemote: async () => null,
      upload: async () => {
        uploaded = true;
        return remote;
      },
      finalize: async () => ready,
      fail: async () => undefined,
    },
  );

  assert.equal(uploaded, false);
  assert.equal(result.version, 9);
});

test("unexpected Cloudinary metadata stops finalization and marks the journal row failed", async () => {
  const failures: string[] = [];
  await assert.rejects(
    () =>
      executeImageUpload(
        { image, idempotencyKey: "22222222-2222-4222-8222-222222222222" },
        {
          randomUUID: () => "11111111-1111-4111-8111-111111111111",
          begin: async () => pendingRow(),
          findRemote: async () => null,
          upload: async () => ({ ...remote, width: 1199 }),
          finalize: async () => {
            throw new Error("must not finalize");
          },
          fail: async (_id, code) => {
            failures.push(code);
          },
        },
      ),
    ImageUploadIntegrityError,
  );
  assert.deepEqual(failures, ["integrity_mismatch"]);
});

test("an ambiguous transport failure remains pending for safe idempotent reconciliation", async () => {
  let markedFailed = false;
  await assert.rejects(() => executeImageUpload(
    { image, idempotencyKey: "22222222-2222-4222-8222-222222222222" },
    {
      randomUUID: () => "11111111-1111-4111-8111-111111111111",
      begin: async () => pendingRow(),
      findRemote: async () => null,
      upload: async () => { throw new Error("connection reset after request"); },
      finalize: async () => pendingRow(),
      fail: async () => { markedFailed = true; },
    },
  ));
  assert.equal(markedFailed, false);
});
