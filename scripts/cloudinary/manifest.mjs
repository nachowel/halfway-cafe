import {
  assertCloudinaryPublicId,
  canonicalStringify,
  createPublicId,
  sha256,
} from "./core.mjs";

export const MANIFEST_SCHEMA_VERSION = 1;

function sortReferences(references) {
  return [...references]
    .map((reference) => ({
      table: reference.table,
      rowId: String(reference.rowId),
      field: reference.field,
      label: reference.label ?? null,
    }))
    .sort((left, right) =>
      `${left.table}\0${left.rowId}\0${left.field}`.localeCompare(
        `${right.table}\0${right.rowId}\0${right.field}`,
      ),
    );
}

function digestPayload(manifest) {
  return {
    schemaVersion: manifest.schemaVersion,
    sourceHost: manifest.sourceHost,
    expectedSourceObjectCount: manifest.expectedSourceObjectCount,
    objects: manifest.objects,
    summary: manifest.summary,
  };
}

export function computeManifestDigest(manifest) {
  return sha256(canonicalStringify(digestPayload(manifest)));
}

export function buildManifest({
  sourceHost,
  generatedAt = new Date().toISOString(),
  objects,
  expectedSourceObjectCount,
}) {
  if (objects.length !== expectedSourceObjectCount) {
    throw new Error(
      `Expected ${expectedSourceObjectCount} source objects, received ${objects.length}`,
    );
  }
  const sorted = [...objects].sort((a, b) =>
    a.objectPath.localeCompare(b.objectPath),
  );
  const byHash = new Map();
  for (const object of sorted) {
    const group = byHash.get(object.sourceSha256) ?? [];
    group.push(object);
    byHash.set(object.sourceSha256, group);
  }
  const canonicalPathByHash = new Map(
    [...byHash].map(([digest, group]) => [
      digest,
      group
        .map((item) => item.objectPath)
        .sort((a, b) => a.localeCompare(b))[0],
    ]),
  );

  const manifestObjects = sorted.map((object) => {
    const canonicalPath = canonicalPathByHash.get(object.sourceSha256);
    return {
      objectPath: object.objectPath,
      sourceSha256: object.sourceSha256,
      bytes: object.bytes,
      format: object.metadata.format,
      mimeType: object.metadata.mimeType,
      width: object.metadata.width,
      height: object.metadata.height,
      sourceModes: [...new Set(object.sourceModes)].sort(),
      sourceUrlFingerprints: [...new Set(object.sourceUrlFingerprints)].sort(),
      publicId: createPublicId(canonicalPath, object.sourceSha256),
      references: sortReferences(object.references),
    };
  });

  const referenceDuplicateObjects = manifestObjects.filter(
    (object) => object.references.length > 1,
  );
  const contentDuplicateGroups = [...byHash.values()].filter(
    (group) => group.length > 1,
  );
  const databaseReferences = manifestObjects.reduce(
    (total, object) =>
      total + object.references.filter((reference) => reference.table !== "code").length,
    0,
  );
  const manifest = {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    generatedAt,
    sourceHost,
    expectedSourceObjectCount,
    objects: manifestObjects,
    summary: {
      sourceObjects: manifestObjects.length,
      destinationAssets: new Set(manifestObjects.map((object) => object.publicId)).size,
      databaseReferences,
      codeReferences: manifestObjects.reduce(
        (total, object) =>
          total + object.references.filter((reference) => reference.table === "code").length,
        0,
      ),
      referenceDuplicateObjects: referenceDuplicateObjects.length,
      duplicateReferences: referenceDuplicateObjects.reduce(
        (total, object) => total + object.references.length - 1,
        0,
      ),
      contentDuplicateGroups: contentDuplicateGroups.length,
      contentDuplicateObjects: contentDuplicateGroups.reduce(
        (total, group) => total + group.length - 1,
        0,
      ),
      totalBytes: manifestObjects.reduce((total, object) => total + object.bytes, 0),
      formats: Object.fromEntries(
        [...new Set(manifestObjects.map((object) => object.format))]
          .sort()
          .map((format) => [
            format,
            manifestObjects.filter((object) => object.format === format).length,
          ]),
      ),
    },
  };
  manifest.manifestSha256 = computeManifestDigest(manifest);
  return manifest;
}

export function verifyManifest(
  manifest,
  { expectedSourceObjectCount = manifest.expectedSourceObjectCount } = {},
) {
  if (manifest.schemaVersion !== MANIFEST_SCHEMA_VERSION) {
    throw new Error(`Unsupported manifest schema version: ${manifest.schemaVersion}`);
  }
  if (manifest.objects.length !== expectedSourceObjectCount) {
    throw new Error(
      `Manifest expected ${expectedSourceObjectCount} objects but contains ${manifest.objects.length}`,
    );
  }
  if (manifest.summary.sourceObjects !== manifest.objects.length) {
    throw new Error("Manifest summary source object count is inconsistent");
  }
  const objectPaths = new Set();
  for (const object of manifest.objects) {
    if (objectPaths.has(object.objectPath)) {
      throw new Error(`Duplicate object path in manifest: ${object.objectPath}`);
    }
    objectPaths.add(object.objectPath);
    assertCloudinaryPublicId(object.publicId);
    if (!/^[a-f0-9]{64}$/.test(object.sourceSha256)) {
      throw new Error(`Invalid source digest for ${object.objectPath}`);
    }
    if (!Array.isArray(object.references) || object.references.length < 1) {
      throw new Error(`Missing references for ${object.objectPath}`);
    }
    if (
      !Number.isInteger(object.bytes) ||
      object.bytes < 1 ||
      !Number.isInteger(object.width) ||
      object.width < 1 ||
      !Number.isInteger(object.height) ||
      object.height < 1
    ) {
      throw new Error(`Invalid image integrity fields for ${object.objectPath}`);
    }
  }
  const actualDigest = computeManifestDigest(manifest);
  if (actualDigest !== manifest.manifestSha256) {
    throw new Error(
      `Manifest digest mismatch: expected ${manifest.manifestSha256}, calculated ${actualDigest}`,
    );
  }
  return true;
}
