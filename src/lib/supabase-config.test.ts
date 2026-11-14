import test from "node:test";
import assert from "node:assert/strict";

import {
  assertSupabasePublicEnvForProductionBuild,
  getMissingSupabasePublicEnvKeys,
} from "./supabase-config.ts";

const configuredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "publishable-key",
};

test("reports both required keys when the public Supabase env is missing", () => {
  assert.deepEqual(getMissingSupabasePublicEnvKeys({}), [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);
});

test("reports the missing key when only one public Supabase value is set", () => {
  assert.deepEqual(
    getMissingSupabasePublicEnvKeys({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    }),
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
  );
});

test("treats whitespace-only values as missing", () => {
  assert.deepEqual(
    getMissingSupabasePublicEnvKeys({
      NEXT_PUBLIC_SUPABASE_URL: "   ",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "\t",
    }),
    ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
  );
});

test("accepts a fully configured public Supabase env", () => {
  assert.deepEqual(getMissingSupabasePublicEnvKeys(configuredEnv), []);
});

test("fails a production build when the public Supabase env is missing", () => {
  assert.throws(
    () => assertSupabasePublicEnvForProductionBuild({}, "phase-production-build"),
    /Missing required public Supabase environment variable/
  );
});

test("allows a production build when the public Supabase env is configured", () => {
  assert.doesNotThrow(() =>
    assertSupabasePublicEnvForProductionBuild(
      configuredEnv,
      "phase-production-build"
    )
  );
});

test("does not fail development or runtime renders", () => {
  assert.doesNotThrow(() =>
    assertSupabasePublicEnvForProductionBuild({}, "phase-development-server")
  );
  assert.doesNotThrow(() =>
    assertSupabasePublicEnvForProductionBuild({}, undefined)
  );
});
