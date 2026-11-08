import { assertCloudinaryPublicId, sha256 } from "./core.mjs";

export const APPROVED_DATABASE_FIELDS = Object.freeze(
  new Map([
    ["site_settings", new Set(["value"])],
    ["categories", new Set(["image_url"])],
    ["menu_items", new Set(["image_url"])],
    ["gallery_images", new Set(["url"])],
  ]),
);

function assertApprovedField(table, field) {
  if (!APPROVED_DATABASE_FIELDS.get(table)?.has(field)) {
    throw new Error(`Database target is not approved: ${table}.${field}`);
  }
}

function buildCloudinaryOriginalUrl({ cloudName, publicId, version, format }) {
  assertCloudinaryPublicId(publicId);
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName)) {
    throw new Error("Invalid Cloudinary cloud name");
  }
  if (!Number.isInteger(Number(version)) || Number(version) < 1) {
    throw new Error(`Missing Cloudinary version for ${publicId}`);
  }
  if (!/^[a-z0-9]+$/i.test(format)) {
    throw new Error(`Invalid Cloudinary format for ${publicId}`);
  }
  const encoded = publicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${cloudName}/image/upload/v${version}/${encoded}.${format}`;
}

export function buildDatabasePlans({
  manifest,
  liveReferences,
  cloudName,
  versionsByPublicId,
}) {
  const objectByPath = new Map(
    manifest.objects.map((object) => [object.objectPath, object]),
  );
  const forward = [];
  const rollback = [];
  for (const reference of liveReferences) {
    assertApprovedField(reference.table, reference.field);
    const object = objectByPath.get(reference.objectPath);
    if (!object) {
      throw new Error(`Live reference is absent from manifest: ${reference.objectPath}`);
    }
    const version = versionsByPublicId.get(object.publicId);
    const destination = buildCloudinaryOriginalUrl({
      cloudName,
      publicId: object.publicId,
      version,
      format: object.format,
    });
    const identity = {
      table: reference.table,
      rowId: String(reference.rowId),
      field: reference.field,
      objectPath: reference.objectPath,
    };
    forward.push({
      ...identity,
      expectedValueSha256: sha256(reference.sourceUrl),
      expectedValue: reference.sourceUrl,
      replacementValue: destination,
    });
    rollback.push({
      ...identity,
      expectedValueSha256: sha256(destination),
      expectedValue: destination,
      replacementValue: reference.sourceUrl,
    });
  }
  const sort = (left, right) =>
    `${left.table}\0${left.rowId}\0${left.field}`.localeCompare(
      `${right.table}\0${right.rowId}\0${right.field}`,
    );
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    forward: forward.sort(sort),
    rollback: rollback.sort(sort),
  };
}

export function verifyDatabasePlans(plans) {
  if (plans.forward.length !== plans.rollback.length) {
    throw new Error("Forward and rollback operation counts differ");
  }
  const rollbackByIdentity = new Map(
    plans.rollback.map((operation) => [
      `${operation.table}\0${operation.rowId}\0${operation.field}`,
      operation,
    ]),
  );
  for (const operation of plans.forward) {
    assertApprovedField(operation.table, operation.field);
    const key = `${operation.table}\0${operation.rowId}\0${operation.field}`;
    const rollback = rollbackByIdentity.get(key);
    if (!rollback) throw new Error(`Missing rollback operation for ${key}`);
    if (
      rollback.expectedValue !== operation.replacementValue ||
      rollback.replacementValue !== operation.expectedValue
    ) {
      throw new Error(`Rollback operation is not an exact inverse for ${key}`);
    }
    if (
      sha256(operation.expectedValue) !== operation.expectedValueSha256 ||
      sha256(rollback.expectedValue) !== rollback.expectedValueSha256
    ) {
      throw new Error(`Database plan fingerprint mismatch for ${key}`);
    }
  }
  return true;
}
