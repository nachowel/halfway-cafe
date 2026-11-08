#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { auditCloudinary, getCloudinaryConfig } from "./cloudinary/cloudinary.mjs";
import {
  buildSignedDeliveryPlan,
  verifySignedDeliveryPlan,
} from "./cloudinary/delivery.mjs";
import {
  EXPECTED_SOURCE_OBJECTS,
  buildLiveInventory,
} from "./cloudinary/inventory.mjs";
import { verifyManifest } from "./cloudinary/manifest.mjs";
import { runMigration } from "./cloudinary/migrate.mjs";
import { buildDatabasePlans, verifyDatabasePlans } from "./cloudinary/rollback.mjs";
import {
  assertStateOutsideRepository,
  loadJournal,
  readJsonIfExists,
  resolveStateRoot,
  saveJournal,
  writePrivateJson,
} from "./cloudinary/state.mjs";
import { normalizeSupabaseStorageUrl } from "./cloudinary/core.mjs";
import { assertCloudinaryPublicId } from "./cloudinary/core.mjs";
import {
  loadVerifiedPilotSource,
  verifyPilotDelivery,
} from "./cloudinary/pilot.mjs";

const COMMANDS = new Set([
  "inventory",
  "audit-cloudinary",
  "migrate",
  "verify",
  "plan-database",
  "plan-delivery",
]);

export function parseCliArguments(argv) {
  const command = argv[0] && !argv[0].startsWith("--") ? argv[0] : "inventory";
  if (!COMMANDS.has(command)) {
    throw new Error(`Unknown command: ${command}`);
  }
  const flags = command === argv[0] ? argv.slice(1) : argv;
  let execute = false;
  let confirmation = null;
  let onlyPublicId = null;
  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];
    if (flag === "--execute") {
      execute = true;
      continue;
    }
    if (flag === "--confirm-manifest") {
      confirmation = flags[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (flag === "--only-public-id") {
      if (onlyPublicId) {
        throw new Error("Pilot execution accepts exactly one --only-public-id value");
      }
      onlyPublicId = flags[index + 1] ?? null;
      index += 1;
      if (!onlyPublicId) throw new Error("--only-public-id requires a value");
      assertCloudinaryPublicId(onlyPublicId);
      continue;
    }
    throw new Error(`Unknown flag: ${flag}`);
  }
  if ((execute || confirmation) && command !== "migrate") {
    throw new Error("Execution flags are only valid with migrate");
  }
  if (onlyPublicId && command !== "migrate") {
    throw new Error("--only-public-id is only valid with migrate");
  }
  if (execute && !confirmation) {
    throw new Error("--execute requires --confirm-manifest <digest>");
  }
  if (confirmation && !/^[a-f0-9]{64}$/.test(confirmation)) {
    throw new Error("Manifest confirmation must be a lowercase 64-character SHA-256 digest");
  }
  if (confirmation && !execute) {
    throw new Error("--confirm-manifest is only valid together with --execute");
  }
  return { command, execute, confirmation, onlyPublicId };
}

function parseEnvFile(contents) {
  const values = {};
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

async function loadEnvironment(repositoryRoot) {
  let local = {};
  try {
    local = parseEnvFile(
      await readFile(path.join(repositoryRoot, ".env.local"), "utf8"),
    );
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  return { ...local, ...process.env };
}

function statePaths(stateRoot) {
  return {
    manifest: path.join(stateRoot, "manifest.json"),
    sourceSnapshot: path.join(stateRoot, "source-snapshot.private.json"),
    journal: path.join(stateRoot, "journal.private.json"),
    cloudinaryAudit: path.join(stateRoot, "cloudinary-audit.private.json"),
    databasePlan: path.join(stateRoot, "database-plan.private.json"),
    deliveryPlan: path.join(stateRoot, "delivery-plan.private.json"),
  };
}

function buildPrivateSourceSnapshot(inventory, supabaseUrl) {
  const expectedHostname = new URL(supabaseUrl).hostname;
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    manifestSha256: inventory.manifest.manifestSha256,
    references: inventory.references.map((reference) => {
      const normalized = normalizeSupabaseStorageUrl(
        reference.sourceUrl,
        expectedHostname,
      );
      return {
        table: reference.table,
        rowId: String(reference.rowId),
        field: reference.field,
        label: reference.label ?? null,
        objectPath: normalized.objectPath,
        sourceUrlFingerprint: normalized.sourceUrlFingerprint,
        sourceUrl: reference.sourceUrl,
      };
    }),
  };
}

async function createInventory({ environment, paths }) {
  const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const inventory = await buildLiveInventory({
    supabaseUrl,
    anonKey,
    expectedSourceObjectCount: EXPECTED_SOURCE_OBJECTS,
  });
  verifyManifest(inventory.manifest, {
    expectedSourceObjectCount: EXPECTED_SOURCE_OBJECTS,
  });
  await writePrivateJson(paths.manifest, inventory.manifest);
  await writePrivateJson(
    paths.sourceSnapshot,
    buildPrivateSourceSnapshot(inventory, supabaseUrl),
  );
  return inventory;
}

export function bindReviewedManifestForExecution({
  reviewedManifest,
  liveInventory,
  confirmation,
}) {
  verifyManifest(reviewedManifest, {
    expectedSourceObjectCount: reviewedManifest.expectedSourceObjectCount,
  });
  verifyManifest(liveInventory.manifest, {
    expectedSourceObjectCount: reviewedManifest.expectedSourceObjectCount,
  });
  if (confirmation !== reviewedManifest.manifestSha256) {
    throw new Error(
      "Execution confirmation must exactly match the reviewed manifest digest",
    );
  }
  if (liveInventory.manifest.manifestSha256 !== reviewedManifest.manifestSha256) {
    throw new Error(
      "Live inventory does not match the reviewed manifest; no upload was attempted",
    );
  }
  return { ...liveInventory, manifest: reviewedManifest };
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function safeInventoryReport(inventory, stateRoot) {
  return {
    mode: "dry-run",
    externalChanges: false,
    stateRoot,
    manifestSha256: inventory.manifest.manifestSha256,
    summary: inventory.manifest.summary,
  };
}

function rawCloudinaryResources(audit) {
  return (audit.namespace?.resources ?? []).map((resource) => ({
    asset_id: resource.assetId,
    public_id: resource.publicId,
    version: resource.version,
    format: resource.format,
    bytes: resource.bytes,
    width: resource.width,
    height: resource.height,
    context: resource.context,
  }));
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseCliArguments(argv);
  const repositoryRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const environment = await loadEnvironment(repositoryRoot);
  const stateRoot = assertStateOutsideRepository(
    resolveStateRoot({ env: environment }),
    repositoryRoot,
  );
  const paths = statePaths(stateRoot);

  if (options.command === "inventory") {
    const inventory = await createInventory({ environment, paths });
    print(safeInventoryReport(inventory, stateRoot));
    return;
  }

  if (options.command === "verify") {
    const manifest = await readJsonIfExists(paths.manifest);
    if (!manifest) throw new Error(`No manifest exists at ${paths.manifest}`);
    verifyManifest(manifest, {
      expectedSourceObjectCount: EXPECTED_SOURCE_OBJECTS,
    });
    print({
      verified: true,
      externalChanges: false,
      stateRoot,
      manifestSha256: manifest.manifestSha256,
      summary: manifest.summary,
    });
    return;
  }

  if (options.command === "audit-cloudinary") {
    const audit = await auditCloudinary({ env: environment });
    if (!audit.available) {
      print({
        available: false,
        externalChanges: false,
        missing: audit.missing,
      });
      return;
    }
    await writePrivateJson(paths.cloudinaryAudit, audit);
    print({
      available: true,
      externalChanges: false,
      cloudName: audit.cloudName,
      plan: audit.usage?.plan ?? null,
      credits: audit.usage?.credits ?? null,
      namespace: {
        prefix: audit.namespace.prefix,
        assetCount: audit.namespace.assetCount,
      },
      stateRoot,
    });
    return;
  }

  if (options.command === "migrate") {
    const requiresReviewedManifest = options.execute || options.onlyPublicId;
    const storedManifest = requiresReviewedManifest
      ? await readJsonIfExists(paths.manifest)
      : null;
    if (requiresReviewedManifest && !storedManifest) {
      throw new Error(`No reviewed manifest exists at ${paths.manifest}`);
    }
    if (storedManifest) {
      verifyManifest(storedManifest, {
        expectedSourceObjectCount: EXPECTED_SOURCE_OBJECTS,
      });
    }
    let inventory;
    if (options.execute && !options.onlyPublicId) {
      if (options.confirmation !== storedManifest.manifestSha256) {
        throw new Error(
          "Execution confirmation must exactly match the reviewed manifest digest",
        );
      }
      const liveInventory = await buildLiveInventory({
        supabaseUrl: environment.NEXT_PUBLIC_SUPABASE_URL?.trim(),
        anonKey: environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
        expectedSourceObjectCount: EXPECTED_SOURCE_OBJECTS,
      });
      inventory = bindReviewedManifestForExecution({
        reviewedManifest: storedManifest,
        liveInventory,
        confirmation: options.confirmation,
      });
    } else {
      inventory = storedManifest
        ? { manifest: storedManifest }
        : await createInventory({ environment, paths });
    }
    if (!options.execute) {
      const dryRun = await runMigration({
        manifest: inventory.manifest,
        execute: false,
        onlyPublicId: options.onlyPublicId,
      });
      print({
        ...safeInventoryReport(inventory, stateRoot),
        migration: dryRun,
      });
      return;
    }

    const configured = getCloudinaryConfig(environment);
    if (!configured.available) {
      throw new Error(
        `Cloudinary execution configuration is missing: ${configured.missing.join(", ")}`,
      );
    }
    const audit = await auditCloudinary({ env: environment });
    let sourceBuffersByObject = inventory.sourceBuffersByObject;
    let selectedSource = null;
    if (options.onlyPublicId) {
      const sourceSnapshot = await readJsonIfExists(paths.sourceSnapshot);
      if (!sourceSnapshot) {
        throw new Error(`No private source snapshot exists at ${paths.sourceSnapshot}`);
      }
      selectedSource = await loadVerifiedPilotSource({
        manifest: inventory.manifest,
        sourceSnapshot,
        publicId: options.onlyPublicId,
      });
      sourceBuffersByObject = new Map([
        [selectedSource.object.objectPath, selectedSource.buffer],
      ]);
    }
    const journal = await loadJournal(
      paths.journal,
      inventory.manifest.manifestSha256,
    );
    const result = await runMigration({
      manifest: inventory.manifest,
      execute: true,
      confirmation: options.confirmation,
      onlyPublicId: options.onlyPublicId,
      requireNewUpload: Boolean(options.onlyPublicId),
      cloudinaryConfig: configured.config,
      existingResources: rawCloudinaryResources(audit),
      sourceBuffersByObject,
      journal,
      onCheckpoint: (value) => saveJournal(paths.journal, value),
    });
    let delivery = null;
    let selectedJournalEntry = null;
    if (options.onlyPublicId) {
      selectedJournalEntry = result.journal.entries[options.onlyPublicId];
      delivery = await verifyPilotDelivery({
        object: selectedSource.object,
        version: Number(selectedJournalEntry.version),
        cloudName: configured.config.cloudName,
        apiSecret: configured.config.apiSecret,
      });
    }
    print({
      mode: result.mode,
      manifestSha256: inventory.manifest.manifestSha256,
      manifestAssets: result.manifestAssets,
      plannedAssets: result.plannedAssets,
      uploaded: result.uploaded,
      existingVerified: result.existingVerified,
      skippedVerified: result.skippedVerified,
      pilot: options.onlyPublicId
        ? {
            publicId: selectedSource.object.publicId,
            objectPath: selectedSource.object.objectPath,
            sourceSha256: selectedSource.object.sourceSha256,
            sourceBytes: selectedSource.object.bytes,
            sourceFormat: selectedSource.object.format,
            sourceWidth: selectedSource.object.width,
            sourceHeight: selectedSource.object.height,
            assetId: selectedJournalEntry.assetId,
            version: selectedJournalEntry.version,
            journalStatus: selectedJournalEntry.status,
            delivery,
          }
        : null,
      stateRoot,
    });
    return;
  }

  if (options.command === "plan-delivery") {
    const manifest = await readJsonIfExists(paths.manifest);
    const journal = await readJsonIfExists(paths.journal);
    if (!manifest || !journal) {
      throw new Error(
        "Delivery planning requires a verified manifest and completed upload journal",
      );
    }
    verifyManifest(manifest, {
      expectedSourceObjectCount: EXPECTED_SOURCE_OBJECTS,
    });
    const configured = getCloudinaryConfig(environment);
    if (!configured.available) {
      throw new Error(
        `Cloudinary delivery configuration is missing: ${configured.missing.join(", ")}`,
      );
    }
    const plan = buildSignedDeliveryPlan({
      manifest,
      journal,
      cloudName: configured.config.cloudName,
      apiSecret: configured.config.apiSecret,
    });
    verifySignedDeliveryPlan(plan, {
      manifest,
      journal,
      apiSecret: configured.config.apiSecret,
    });
    await writePrivateJson(paths.deliveryPlan, plan);
    print({
      planned: true,
      externalChanges: false,
      manifestSha256: plan.manifestSha256,
      deliveryPlanSha256: plan.deliveryPlanSha256,
      objects: plan.summary.objects,
      candidates: plan.summary.candidates,
      stateRoot,
    });
    return;
  }

  if (options.command === "plan-database") {
    const manifest = await readJsonIfExists(paths.manifest);
    const snapshot = await readJsonIfExists(paths.sourceSnapshot);
    const journal = await readJsonIfExists(paths.journal);
    if (!manifest || !snapshot || !journal) {
      throw new Error(
        "Database planning requires a verified manifest, private source snapshot, and completed migration journal",
      );
    }
    verifyManifest(manifest, {
      expectedSourceObjectCount: EXPECTED_SOURCE_OBJECTS,
    });
    const configured = getCloudinaryConfig(environment);
    if (!configured.available) {
      throw new Error(
        `Cloudinary cloud name is unavailable: ${configured.missing.join(", ")}`,
      );
    }
    const versions = new Map(
      Object.values(journal.entries)
        .filter((entry) => Number.isInteger(Number(entry.version)))
        .map((entry) => [entry.publicId, Number(entry.version)]),
    );
    const plans = buildDatabasePlans({
      manifest,
      liveReferences: snapshot.references.filter(
        (reference) => reference.table !== "code",
      ),
      cloudName: configured.config.cloudName,
      versionsByPublicId: versions,
    });
    verifyDatabasePlans(plans);
    await writePrivateJson(paths.databasePlan, plans);
    print({
      planned: true,
      applied: false,
      operations: plans.forward.length,
      stateRoot,
    });
  }
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
