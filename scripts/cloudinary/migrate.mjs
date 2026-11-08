import { assertCloudinaryPublicId, withRetry } from "./core.mjs";
import { resourceMatchesSource, uploadImage } from "./cloudinary.mjs";
import { verifyManifest } from "./manifest.mjs";
import { recordJournalEntry } from "./state.mjs";

const COMPLETED_STATUSES = new Set(["verified", "existing_verified"]);

export async function runMigration({
  manifest,
  execute = false,
  confirmation,
  onlyPublicId = null,
  requireNewUpload = false,
  cloudinaryConfig,
  existingResources = [],
  sourceBuffersByObject = new Map(),
  journal = {
    schemaVersion: 1,
    manifestSha256: manifest.manifestSha256,
    entries: {},
  },
  uploadFn = uploadImage,
  onCheckpoint = async () => {},
  retryOptions = {},
}) {
  verifyManifest(manifest, {
    expectedSourceObjectCount: manifest.expectedSourceObjectCount,
  });
  const manifestAssets = [
    ...new Map(
      manifest.objects.map((object) => [object.publicId, object]),
    ).values(),
  ].sort((left, right) => left.publicId.localeCompare(right.publicId));
  for (const asset of manifestAssets) assertCloudinaryPublicId(asset.publicId);
  if (onlyPublicId) assertCloudinaryPublicId(onlyPublicId);
  const assets = onlyPublicId
    ? manifestAssets.filter((asset) => asset.publicId === onlyPublicId)
    : manifestAssets;
  if (onlyPublicId && assets.length !== 1) {
    throw new Error(`Selected public ID is not present exactly once in the manifest`);
  }
  if (requireNewUpload && !onlyPublicId) {
    throw new Error("A new-upload pilot requires exactly one selected public ID");
  }

  if (!execute) {
    return {
      mode: "dry-run",
      manifestAssets: manifestAssets.length,
      plannedAssets: assets.length,
      uploadsAttempted: 0,
      uploaded: 0,
      existingVerified: 0,
      skippedVerified: 0,
      journal,
    };
  }
  if (!confirmation || confirmation !== manifest.manifestSha256) {
    throw new Error(
      "Execution confirmation must exactly match the reviewed manifest digest",
    );
  }
  if (
    !cloudinaryConfig?.cloudName ||
    !cloudinaryConfig?.apiKey ||
    !cloudinaryConfig?.apiSecret
  ) {
    throw new Error("Cloudinary execution credentials are unavailable");
  }
  if (journal.manifestSha256 !== manifest.manifestSha256) {
    throw new Error("Journal manifest does not match the execution manifest");
  }

  const existingByPublicId = new Map(
    existingResources.map((resource) => [resource.public_id, resource]),
  );
  for (const asset of manifestAssets) {
    const existing = existingByPublicId.get(asset.publicId);
    if (existing && !resourceMatchesSource(existing, asset)) {
      throw new Error(
        `Cloudinary collision for ${asset.publicId}; existing asset was not modified`,
      );
    }
  }
  if (requireNewUpload && existingByPublicId.has(onlyPublicId)) {
    throw new Error(
      `Selected pilot asset already exists at ${onlyPublicId}; no upload was attempted`,
    );
  }

  let currentJournal = journal;
  const result = {
    mode: "execute",
    manifestAssets: manifestAssets.length,
    plannedAssets: assets.length,
    uploadsAttempted: 0,
    uploaded: 0,
    existingVerified: 0,
    skippedVerified: 0,
  };

  for (const asset of assets) {
    const existing = existingByPublicId.get(asset.publicId);
    const journalEntry = currentJournal.entries[asset.publicId];
    if (
      existing &&
      journalEntry?.sourceSha256 === asset.sourceSha256 &&
      COMPLETED_STATUSES.has(journalEntry.status)
    ) {
      result.skippedVerified += 1;
      continue;
    }
    if (existing) {
      currentJournal = recordJournalEntry(currentJournal, {
        publicId: asset.publicId,
        sourceSha256: asset.sourceSha256,
        status: "existing_verified",
        assetId: existing.asset_id ?? existing.assetId ?? null,
        version: existing.version ?? null,
      });
      await onCheckpoint(currentJournal);
      result.existingVerified += 1;
      continue;
    }

    const buffer = sourceBuffersByObject.get(asset.objectPath);
    if (!Buffer.isBuffer(buffer)) {
      throw new Error(`No source bytes available for ${asset.objectPath}`);
    }
    result.uploadsAttempted += 1;
    const uploaded = await withRetry(
      () =>
        uploadFn({
          config: cloudinaryConfig,
          object: asset,
          buffer,
        }),
      retryOptions,
    );
    if (!resourceMatchesSource(uploaded, asset)) {
      throw new Error(`Cloudinary integrity verification failed for ${asset.publicId}`);
    }
    currentJournal = recordJournalEntry(currentJournal, {
      publicId: asset.publicId,
      sourceSha256: asset.sourceSha256,
      status: "verified",
      assetId: uploaded.asset_id ?? uploaded.assetId ?? null,
      version: uploaded.version,
    });
    await onCheckpoint(currentJournal);
    result.uploaded += 1;
  }

  return { ...result, journal: currentJournal };
}
