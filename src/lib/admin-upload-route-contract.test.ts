import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const routeSource = readFileSync(
  new URL("../app/api/admin/images/upload/route.ts", import.meta.url),
  "utf8",
);

test("upload API retains its established public error responses", () => {
  for (const contract of [
    '{ error: "Authentication required" }, { status: 401 }',
    '{ error: "Forbidden" }, { status: 403 }',
    '{ error: error.message }, { status: 400 }',
    '{ error: "Upload rate limit exceeded" }, { status: 429 }',
    '{ error: "Upload integrity verification failed" }, { status: 409 }',
    '{ error: "Image upload failed" }, { status: 500 }',
  ]) {
    assert.equal(routeSource.includes(contract), true, `missing response contract: ${contract}`);
  }
});
