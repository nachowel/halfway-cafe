import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const PUBLIC_SOURCE_ROOTS = ["src/app", "src/components"];

async function collectPublicSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entryPath.replaceAll("\\", "/").includes("/app/admin")) continue;
      files.push(...(await collectPublicSourceFiles(entryPath)));
      continue;
    }

    if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(entryPath);
  }

  return files;
}

async function readPublicSources() {
  const files = (
    await Promise.all(PUBLIC_SOURCE_ROOTS.map(collectPublicSourceFiles))
  ).flat();

  return Promise.all(
    files.map(async (file) => ({
      file: file.replaceAll("\\", "/"),
      source: await readFile(file, "utf8"),
    })),
  );
}

const SATURDAY_AT_SEVEN_PATTERNS = [
  /Mon\s*[–-]\s*Sat:\s*7:00am\s*[–-]\s*3:00pm/gi,
  /Mon[–-]?Sat:?\s*7:00am\s*[–-]?\s*3:00pm/gi,
  /Monday to Saturday[^.\n]{0,60}(?:from|at) 7(?::00)?am/gi,
  /(?:from|at) 7(?::00)?am[^.\n]{0,60}Monday to Saturday/gi,
  /(?:from|at) 7:00am Monday\s+to Saturday/gi,
];

test("public opening-hours copy never claims Saturday opens at 7am", async () => {
  const sources = await readPublicSources();
  const staleReferences = [];

  for (const { file, source } of sources) {
    for (const pattern of SATURDAY_AT_SEVEN_PATTERNS) {
      for (const match of source.matchAll(pattern)) {
        staleReferences.push(`${file}: ${match[0].replace(/\s+/g, " ")}`);
      }
    }
  }

  assert.deepEqual(staleReferences, []);
});

test("public opening-hours copy never marks Sunday as closed", async () => {
  const sources = await readPublicSources();
  const staleReferences = sources.flatMap(({ file, source }) =>
    [...source.matchAll(/(?:Sunday[^.\n]{0,50}closed|closed[^.\n]{0,50}Sunday)/gi)].map(
      (match) => `${file}: ${match[0].replace(/\s+/g, " ")}`,
    ),
  );

  assert.deepEqual(staleReferences, []);
});
