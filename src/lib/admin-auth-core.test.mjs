import assert from "node:assert/strict";
import { test } from "node:test";

import { HALFWAY_ADMIN_ROLE, hasHalfwayAdminClaim } from "./admin-auth-core.ts";

test("trusted app_metadata role grants Halfway admin authorization", () => {
  assert.equal(
    hasHalfwayAdminClaim({ app_metadata: { role: "halfway_admin" } }),
    true,
  );
  assert.equal(HALFWAY_ADMIN_ROLE, "halfway_admin");
});

test("user_metadata is never trusted for authorization", () => {
  assert.equal(
    hasHalfwayAdminClaim({
      app_metadata: {},
      user_metadata: { role: "halfway_admin" },
    }),
    false,
  );
  assert.equal(
    hasHalfwayAdminClaim({
      app_metadata: { role: "authenticated" },
      user_metadata: { role: "halfway_admin" },
    }),
    false,
  );
});

test("ordinary authenticated roles are denied", () => {
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { role: "authenticated" } }), false);
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { role: "anon" } }), false);
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { provider: "email" } }), false);
});

test("role matching is exact and string-typed", () => {
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { role: "Halfway_Admin" } }), false);
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { role: "halfway_admin " } }), false);
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { role: true } }), false);
  assert.equal(hasHalfwayAdminClaim({ app_metadata: { role: ["halfway_admin"] } }), false);
});

test("missing claims are denied", () => {
  assert.equal(hasHalfwayAdminClaim(null), false);
  assert.equal(hasHalfwayAdminClaim(undefined), false);
  assert.equal(hasHalfwayAdminClaim({}), false);
  assert.equal(hasHalfwayAdminClaim({ app_metadata: null }), false);
});
