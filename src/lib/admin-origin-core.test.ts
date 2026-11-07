import assert from "node:assert/strict";
import { test } from "node:test";

import { assertSameOriginMutation } from "./admin-origin-core.ts";

test("state-changing admin requests require the same origin", () => {
  assert.doesNotThrow(() =>
    assertSameOriginMutation(
      new Request("https://preview.example.test/api/admin/images/upload", {
        method: "POST",
        headers: { origin: "https://preview.example.test", "sec-fetch-site": "same-origin" },
      }),
    ),
  );
  assert.throws(
    () =>
      assertSameOriginMutation(
        new Request("https://preview.example.test/api/admin/images/upload", {
          method: "POST",
          headers: { origin: "https://evil.example", "sec-fetch-site": "cross-site" },
        }),
      ),
    /origin/,
  );
  assert.throws(
    () =>
      assertSameOriginMutation(
        new Request("https://preview.example.test/api/admin/images/upload", { method: "POST" }),
      ),
    /Origin header/,
  );
});
