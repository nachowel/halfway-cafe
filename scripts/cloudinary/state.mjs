import { randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export function resolveStateRoot({
  env = process.env,
  platform = process.platform,
  homedir = os.homedir(),
  tmpdir = os.tmpdir(),
  localAppData = env.LOCALAPPDATA,
} = {}) {
  if (env.HALFWAY_MIGRATION_STATE_DIR) {
    return path.resolve(env.HALFWAY_MIGRATION_STATE_DIR);
  }
  if (platform === "win32") {
    return path.resolve(
      localAppData || tmpdir,
      "HalfwayCafe",
      "cloudinary-migration",
    );
  }
  return path.resolve(
    env.XDG_STATE_HOME || path.join(homedir, ".local", "state"),
    "halfway-cafe",
    "cloudinary-migration",
  );
}

export function assertStateOutsideRepository(stateRoot, repositoryRoot) {
  const state = path.resolve(stateRoot);
  const repository = path.resolve(repositoryRoot);
  const relative = path.relative(repository, state);
  const isInside =
    relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
  if (isInside) {
    throw new Error(
      `Migration state must remain outside the repository: ${state}`,
    );
  }
  return state;
}

export async function writePrivateJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
    flag: "wx",
  });
  try {
    await chmod(temporaryPath, 0o600);
  } catch {
    // Windows ACLs do not map exactly to POSIX modes. The external state root
    // still prevents accidental source-control inclusion.
  }
  await rename(temporaryPath, filePath);
  try {
    await chmod(filePath, 0o600);
  } catch {
    // See note above.
  }
}

export async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function loadJournal(filePath, manifestSha256) {
  const existing = await readJsonIfExists(filePath);
  if (!existing) {
    return {
      schemaVersion: 1,
      manifestSha256,
      entries: {},
    };
  }
  if (existing.manifestSha256 !== manifestSha256) {
    throw new Error(
      `Journal manifest mismatch: expected ${manifestSha256}, found ${existing.manifestSha256}`,
    );
  }
  if (!existing.entries || typeof existing.entries !== "object") {
    throw new Error("Journal entries are invalid");
  }
  return existing;
}

export function recordJournalEntry(journal, entry) {
  if (!entry.publicId || !entry.sourceSha256 || !entry.status) {
    throw new Error("Journal entry requires publicId, sourceSha256, and status");
  }
  return {
    ...journal,
    entries: {
      ...journal.entries,
      [entry.publicId]: {
        ...entry,
      },
    },
  };
}

export async function saveJournal(filePath, journal) {
  await writePrivateJson(filePath, journal);
}
