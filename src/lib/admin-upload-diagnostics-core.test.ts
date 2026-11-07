import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createUploadDiagnostics,
  type UploadDiagnosticRecord,
} from "./admin-upload-diagnostics-core.ts";

const requestId = "44444444-4444-4444-8444-444444444444";

test("successful stages share one correlation ID and record safe timing data", async () => {
  const records: UploadDiagnosticRecord[] = [];
  const times = [100, 109];
  const diagnostics = createUploadDiagnostics(requestId, {
    sink: (record) => records.push(record),
    now: () => times.shift() ?? 109,
  });

  const result = await diagnostics.run("validation", async () => "validated");

  assert.equal(result, "validated");
  assert.deepEqual(records, [
    {
      event: "admin_image_upload",
      requestId,
      stage: "validation",
      status: "started",
      elapsedMs: 0,
    },
    {
      event: "admin_image_upload",
      requestId,
      stage: "validation",
      status: "completed",
      elapsedMs: 9,
    },
  ]);
});

test("a failed stage is recorded before the original error is rethrown", async () => {
  const records: UploadDiagnosticRecord[] = [];
  const failure = new Error("provider response must remain private");
  const diagnostics = createUploadDiagnostics(requestId, {
    sink: (record) => records.push(record),
  });

  await assert.rejects(
    () => diagnostics.run("supabase_finalization", async () => { throw failure; }),
    (error) => error === failure,
  );

  assert.equal(records.at(-1)?.stage, "supabase_finalization");
  assert.equal(records.at(-1)?.status, "failed");
  assert.equal(records.at(-1)?.errorClass, "Error");
  assert.equal(JSON.stringify(records).includes(failure.message), false);
});

test("nested Cloudinary failures expose only a safe HTTP status", async () => {
  const records: UploadDiagnosticRecord[] = [];
  const sensitive = {
    error: { http_code: 401, message: "cloudinary-secret-value" },
    code: "SUPER_SECRET_VALUE",
    stack: "private stack",
  };
  const diagnostics = createUploadDiagnostics(requestId, {
    sink: (record) => records.push(record),
  });

  await assert.rejects(
    () => diagnostics.run("cloudinary_find_remote", async () => { throw sensitive; }),
    (error) => error === sensitive,
  );

  const failed = records.at(-1);
  assert.equal(failed?.status, "failed");
  assert.equal(failed?.errorClass, "UnknownError");
  assert.equal(failed?.httpStatus, 401);
  assert.equal(failed?.errorCode, undefined);
  const serialized = JSON.stringify(records);
  assert.equal(serialized.includes("cloudinary-secret-value"), false);
  assert.equal(serialized.includes("SUPER_SECRET_VALUE"), false);
  assert.equal(serialized.includes("private stack"), false);
});

test("diagnostic sink failures never change upload behavior", async () => {
  const diagnostics = createUploadDiagnostics(requestId, {
    sink: () => { throw new Error("logging unavailable"); },
  });

  assert.equal(await diagnostics.run("preview_resolution", () => 42), 42);
});
