import { assertCloudinaryPublicId, canonicalStringify, sha256 } from "./core.mjs";
import { verifyManifest } from "./manifest.mjs";

export const APPLICATION_MAPPING_SCHEMA_VERSION = 1;
export const APPROVED_MANIFEST_SHA256 =
  "ea214f628cdf683990015e595a4946af0333c6a7acc7a8ba8512e79bb94a8cb7";
export const APPROVED_ASSET_COUNT = 101;

function assertVerifiedEntry(object, entry) {
  if (!entry) {
    throw new Error(`Missing journal entry for ${object.publicId}`);
  }
  if (entry.publicId !== object.publicId) {
    throw new Error(`Journal public ID mismatch for ${object.publicId}`);
  }
  if (entry.status !== "verified" && entry.status !== "existing_verified") {
    throw new Error(`Journal entry is not verified for ${object.publicId}`);
  }
  if (entry.sourceSha256 !== object.sourceSha256) {
    throw new Error(`Journal source digest mismatch for ${object.publicId}`);
  }
  if (!Number.isInteger(entry.version) || entry.version < 1) {
    throw new Error(`Journal version is invalid for ${object.publicId}`);
  }
}

export function buildApplicationMapping({ manifest, journal }) {
  verifyManifest(manifest, { expectedSourceObjectCount: APPROVED_ASSET_COUNT });
  if (journal?.schemaVersion !== 1 || journal.manifestSha256 !== manifest.manifestSha256) {
    throw new Error("Journal manifest does not match the approved manifest");
  }
  if (!journal.entries || typeof journal.entries !== "object") {
    throw new Error("Journal entries are invalid");
  }

  const manifestIds = new Set(manifest.objects.map((object) => object.publicId));
  const extra = Object.keys(journal.entries).find((publicId) => !manifestIds.has(publicId));
  if (extra) throw new Error(`Extra journal entry: ${extra}`);

  const assets = [...manifest.objects]
    .sort((left, right) => left.objectPath.localeCompare(right.objectPath))
    .map((object) => {
      assertCloudinaryPublicId(object.publicId);
      if (!object.publicId.startsWith("halfway-cafe/")) {
        throw new Error(`Public ID is outside the halfway-cafe namespace: ${object.publicId}`);
      }
      const entry = journal.entries[object.publicId];
      assertVerifiedEntry(object, entry);
      return {
        objectPath: object.objectPath,
        publicId: object.publicId,
        version: entry.version,
        format: object.format,
        width: object.width,
        height: object.height,
      };
    });

  return {
    schemaVersion: APPLICATION_MAPPING_SCHEMA_VERSION,
    manifestSha256: manifest.manifestSha256,
    sourceHost: manifest.sourceHost,
    assets,
  };
}

export function computeApplicationMappingDigest(mapping) {
  return sha256(canonicalStringify(mapping));
}

