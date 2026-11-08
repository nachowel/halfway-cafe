#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  APPROVED_MANIFEST_SHA256,
  buildApplicationMapping,
  computeApplicationMappingDigest,
} from "./cloudinary/app-mapping.mjs";
import { assertStateOutsideRepository, resolveStateRoot } from "./cloudinary/state.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stateRoot = assertStateOutsideRepository(resolveStateRoot(), repositoryRoot);
const manifest = JSON.parse(await readFile(path.join(stateRoot, "manifest.json"), "utf8"));
const journal = JSON.parse(await readFile(path.join(stateRoot, "journal.private.json"), "utf8"));

if (manifest.manifestSha256 !== APPROVED_MANIFEST_SHA256) {
  throw new Error(
    `Refusing unapproved manifest: expected ${APPROVED_MANIFEST_SHA256}, found ${manifest.manifestSha256}`,
  );
}

const mapping = buildApplicationMapping({ manifest, journal });
const outputPath = path.join(repositoryRoot, "src", "data", "cloudinary-assets.v1.json");
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(mapping, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  outputPath,
  manifestSha256: mapping.manifestSha256,
  mappingSha256: computeApplicationMappingDigest(mapping),
  assets: mapping.assets.length,
}));
