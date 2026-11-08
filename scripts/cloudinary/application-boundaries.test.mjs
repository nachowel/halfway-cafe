import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "..", "..");
const sourceRoot = path.join(repositoryRoot, "src");

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(target));
    else if (/\.tsx?$/.test(entry.name)) files.push(target);
  }
  return files;
}

function relative(file) {
  return path.relative(repositoryRoot, file).replaceAll("\\", "/");
}

test("client components cannot import signing code, private mappings, or secrets", async () => {
  const violations = [];
  for (const file of await filesBelow(sourceRoot)) {
    const source = await readFile(file, "utf8");
    if (!/^\s*["']use client["'];/m.test(source)) continue;
    if (/public-images\.server|public-image-core|cloudinary-assets\.v1\.json|CLOUDINARY_API_SECRET/.test(source)) {
      violations.push(relative(file));
    }
  }
  assert.deepEqual(violations, []);
});

test("public application images bypass the Vercel optimizer", async () => {
  const violations = [];
  for (const file of await filesBelow(sourceRoot)) {
    const name = relative(file);
    if (name.endsWith(".test.ts") || name.endsWith(".test.tsx")) continue;
    if (name.startsWith("src/app/admin/") || name.startsWith("src/components/admin/")) continue;
    // Pre-existing emergency recovery component is deliberately isolated from Phase 7.
    if (name === "src/components/ui/PublicImage.tsx") continue;
    const source = await readFile(file, "utf8");
    if (/from\s+["']next\/image["']/.test(source) || source.includes("/_next/image")) {
      violations.push(name);
    }
  }
  assert.deepEqual(violations, []);
});

test("the public mapping contains no private migration material", async () => {
  const mappingPath = path.join(sourceRoot, "data", "cloudinary-assets.v1.json");
  const source = await readFile(mappingPath, "utf8");
  const mapping = JSON.parse(source);
  assert.equal(mapping.assets.length, 101);
  const lattice = [96, 192, 256, 384, 640, 828, 1080, 1376, 1600];
  const candidateCount = mapping.assets.reduce((total, asset) => {
    const widths = lattice.filter((width) => width <= asset.width);
    const intrinsicEndpoint = asset.width < lattice.at(-1) && !widths.includes(asset.width) ? 1 : 0;
    return total + widths.length + intrinsicEndpoint;
  }, 0);
  assert.equal(candidateCount, 737);
  assert.equal(source.includes("token="), false);
  assert.equal(source.includes("supabase.co/storage"), false);
  assert.equal(source.includes("assetId"), false);
  assert.equal(source.includes("sourceSha256"), false);
  assert.equal(source.includes("apiSecret"), false);
});
