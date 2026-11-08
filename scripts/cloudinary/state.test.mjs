import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  assertStateOutsideRepository,
  loadJournal,
  recordJournalEntry,
  resolveStateRoot,
  saveJournal,
  writePrivateJson,
} from "./state.mjs";
import {
  buildDatabasePlans,
  verifyDatabasePlans,
} from "./rollback.mjs";

test("defaults migration state outside the repository", () => {
  const root = resolveStateRoot({
    env: {},
    platform: "win32",
    homedir: "C:\\Users\\tester",
    tmpdir: "C:\\Temp",
    localAppData: "C:\\Users\\tester\\AppData\\Local",
  });
  assert.equal(
    root,
    path.resolve(
      "C:\\Users\\tester\\AppData\\Local",
      "HalfwayCafe",
      "cloudinary-migration",
    ),
  );
});

test("rejects migration state inside the repository", () => {
  const repo = path.resolve("C:\\work\\halfway");
  assert.throws(
    () => assertStateOutsideRepository(path.join(repo, "artifacts"), repo),
    /outside the repository/i,
  );
  assert.doesNotThrow(() =>
    assertStateOutsideRepository(path.resolve("C:\\migration-state"), repo),
  );
});

test("writes private JSON atomically and resumes journal entries idempotently", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "halfway-state-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const journalPath = path.join(directory, "journal.json");

  let journal = await loadJournal(journalPath, "a".repeat(64));
  journal = recordJournalEntry(journal, {
    publicId: "halfway-cafe/menu/item--aaaaaaaaaaaa",
    sourceSha256: "b".repeat(64),
    status: "verified",
  });
  journal = recordJournalEntry(journal, {
    publicId: "halfway-cafe/menu/item--aaaaaaaaaaaa",
    sourceSha256: "b".repeat(64),
    status: "verified",
  });
  await saveJournal(journalPath, journal);

  const resumed = await loadJournal(journalPath, "a".repeat(64));
  assert.equal(Object.keys(resumed.entries).length, 1);
  assert.equal(
    resumed.entries["halfway-cafe/menu/item--aaaaaaaaaaaa"].status,
    "verified",
  );
  await assert.rejects(loadJournal(journalPath, "c".repeat(64)), /manifest/i);

  const privatePath = path.join(directory, "rollback.private.json");
  await writePrivateJson(privatePath, { secret: "exact-original-value" });
  assert.deepEqual(JSON.parse(await readFile(privatePath, "utf8")), {
    secret: "exact-original-value",
  });
});

test("plans exact forward and rollback database operations without applying them", () => {
  const manifest = {
    objects: [
      {
        objectPath: "menu/item.png",
        publicId: "halfway-cafe/menu/item--aaaaaaaaaaaa",
        format: "png",
        sourceSha256: "a".repeat(64),
        references: [
          { table: "menu_items", rowId: "row-1", field: "image_url" },
          { table: "code", rowId: "src/file.tsx", field: "hardcoded_url" },
        ],
      },
    ],
  };
  const original =
    "https://project.supabase.co/storage/v1/object/sign/menu/item.png?token=preserve-exactly";
  const plans = buildDatabasePlans({
    manifest,
    cloudName: "shared-cloud",
    versionsByPublicId: new Map([
      ["halfway-cafe/menu/item--aaaaaaaaaaaa", 1234],
    ]),
    liveReferences: [
      {
        table: "menu_items",
        rowId: "row-1",
        field: "image_url",
        objectPath: "menu/item.png",
        sourceUrl: original,
      },
    ],
  });

  assert.equal(plans.forward.length, 1);
  assert.equal(plans.rollback.length, 1);
  assert.equal(plans.forward[0].expectedValue, original);
  assert.equal(
    plans.forward[0].replacementValue,
    "https://res.cloudinary.com/shared-cloud/image/upload/v1234/halfway-cafe/menu/item--aaaaaaaaaaaa.png",
  );
  assert.equal(plans.rollback[0].replacementValue, original);
  assert.doesNotThrow(() => verifyDatabasePlans(plans));
});

test("rejects rollback planning for unapproved tables or fields", () => {
  const manifest = {
    objects: [
      {
        objectPath: "menu/item.png",
        publicId: "halfway-cafe/menu/item--aaaaaaaaaaaa",
        format: "png",
        sourceSha256: "a".repeat(64),
        references: [],
      },
    ],
  };
  assert.throws(
    () =>
      buildDatabasePlans({
        manifest,
        cloudName: "shared-cloud",
        versionsByPublicId: new Map([
          ["halfway-cafe/menu/item--aaaaaaaaaaaa", 1234],
        ]),
        liveReferences: [
          {
            table: "users",
            rowId: "row-1",
            field: "avatar",
            objectPath: "menu/item.png",
            sourceUrl: "https://example.test/original",
          },
        ],
      }),
    /not approved/i,
  );
});
