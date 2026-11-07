import assert from "node:assert/strict";
import { test } from "node:test";

import { hasHalfwayAdminClaim } from "./admin-auth-core.ts";

test("only the trusted app_metadata claim grants Halfway admin access", () => {
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { role: "halfway_admin" } }), true);
  assert.equal(
    hasHalfwayAdminClaim({
      app_metadata: {},
      user_metadata: { role: "halfway_admin" },
    }),
    false,
  );
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { role: "authenticated" } }), false);
  assert.equal(hasHalfwayAdminClaim(null), false);
});
