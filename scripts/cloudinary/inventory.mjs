import {
  RetryableHttpError,
  inspectImage,
  normalizeSupabaseStorageUrl,
  sha256,
  withRetry,
} from "./core.mjs";
import { buildManifest } from "./manifest.mjs";

export const EXPECTED_SOURCE_OBJECTS = 101;

export const SUPPLEMENTAL_OBJECTS = Object.freeze([
  {
    objectPath: "Hero/icon-logo.png",
    label: "Hardcoded public logo",
    sourceFile: "src/components/layout/Navbar.tsx",
  },
  {
    objectPath: "Hero/breakfast-hero.webp",
    label: "Hardcoded breakfast hero",
    sourceFile: "src/lib/storage.ts",
  },
]);

const TABLES = Object.freeze([
  {
    table: "site_settings",
    field: "value",
    select: "id,key,value",
    label: (row) => row.key,
  },
  {
    table: "categories",
    field: "image_url",
    select: "id,slug,image_url",
    label: (row) => row.slug,
  },
  {
    table: "menu_items",
    field: "image_url",
    select: "id,name,image_url",
    label: (row) => row.name,
  },
  {
    table: "gallery_images",
    field: "url",
    select: "id,alt_text,url",
    label: (row) => row.alt_text || row.id,
  },
]);

function publicObjectUrl(supabaseUrl, objectPath) {
  const encoded = objectPath.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${encoded}`;
}

export function addSupplementalReferences(references, supabaseUrl) {
  return [
    ...references,
    ...SUPPLEMENTAL_OBJECTS.map((item) => ({
      table: "code",
      rowId: item.sourceFile,
      field: "hardcoded_url",
      label: item.label,
      sourceUrl: publicObjectUrl(supabaseUrl, item.objectPath),
      expectedObjectPath: item.objectPath,
    })),
  ];
}

export function deduplicateReferences(references, expectedHostname) {
  const groups = new Map();
  for (const reference of references) {
    const normalized = normalizeSupabaseStorageUrl(
      reference.sourceUrl,
      expectedHostname,
    );
    if (
      reference.expectedObjectPath &&
      reference.expectedObjectPath !== normalized.objectPath
    ) {
      throw new Error(
        `Supplemental object mismatch: expected ${reference.expectedObjectPath}, got ${normalized.objectPath}`,
      );
    }
    const existing = groups.get(normalized.objectPath) ?? {
      objectPath: normalized.objectPath,
      sourceUrls: [],
      sourceUrlFingerprints: [],
      sourceModes: [],
      references: [],
    };
    if (!existing.sourceUrls.includes(reference.sourceUrl)) {
      existing.sourceUrls.push(reference.sourceUrl);
    }
    if (!existing.sourceUrlFingerprints.includes(normalized.sourceUrlFingerprint)) {
      existing.sourceUrlFingerprints.push(normalized.sourceUrlFingerprint);
    }
    if (!existing.sourceModes.includes(normalized.mode)) {
      existing.sourceModes.push(normalized.mode);
    }
    existing.references.push({
      table: reference.table,
      rowId: String(reference.rowId),
      field: reference.field,
      label: reference.label ?? null,
    });
    groups.set(normalized.objectPath, existing);
  }
  return groups;
}

async function fetchTable({
  supabaseUrl,
  anonKey,
  table,
  select,
  fetchImpl,
}) {
  const endpoint = new URL(`/rest/v1/${table}`, `${supabaseUrl.replace(/\/+$/, "")}/`);
  endpoint.searchParams.set("select", select);
  const response = await withRetry(async () => {
    const current = await fetchImpl(endpoint, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Range: "0-9999",
      },
    });
    if (!current.ok) {
      const error = new Error(`Supabase ${table} query failed with HTTP ${current.status}`);
      error.status = current.status;
      if (
        current.status === 408 ||
        current.status === 429 ||
        current.status >= 500
      ) {
        throw new RetryableHttpError(error.message, current.status);
      }
      throw error;
    }
    return current;
  });
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`Supabase ${table} query did not return an array`);
  }
  return data;
}

export async function collectSupabaseReferences({
  supabaseUrl,
  anonKey,
  fetchImpl = fetch,
}) {
  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  const references = [];
  for (const spec of TABLES) {
    const rows = await fetchTable({
      supabaseUrl,
      anonKey,
      table: spec.table,
      select: spec.select,
      fetchImpl,
    });
    for (const row of rows) {
      const sourceUrl = row[spec.field];
      if (typeof sourceUrl !== "string" || !sourceUrl.includes("/storage/v1/object/")) {
        continue;
      }
      references.push({
        table: spec.table,
        rowId: row.id,
        field: spec.field,
        label: spec.label(row),
        sourceUrl,
      });
    }
  }
  return addSupplementalReferences(references, supabaseUrl);
}

function parseRetryAfter(response) {
  const raw = response.headers.get("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}

export async function downloadSourceObject({
  sourceUrl,
  fetchImpl = fetch,
  timeoutMs = 30_000,
  maxBytes = 25 * 1024 * 1024,
}) {
  return withRetry(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(sourceUrl, { signal: controller.signal });
      if (!response.ok) {
        const message = `Source image request failed with HTTP ${response.status}`;
        if (
          response.status === 408 ||
          response.status === 429 ||
          response.status >= 500
        ) {
          throw new RetryableHttpError(
            message,
            response.status,
            parseRetryAfter(response),
          );
        }
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }
      const declaredLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        throw new Error(`Source image exceeds ${maxBytes} bytes`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > maxBytes) {
        throw new Error(`Source image exceeds ${maxBytes} bytes`);
      }
      return {
        buffer,
        metadata: inspectImage(buffer),
        contentType: response.headers.get("content-type"),
      };
    } finally {
      clearTimeout(timeout);
    }
  });
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (true) {
        const index = cursor;
        cursor += 1;
        if (index >= items.length) return;
        results[index] = await mapper(items[index], index);
      }
    }),
  );
  return results;
}

export async function buildLiveInventory({
  supabaseUrl,
  anonKey,
  fetchImpl = fetch,
  expectedSourceObjectCount = EXPECTED_SOURCE_OBJECTS,
  generatedAt = new Date().toISOString(),
  concurrency = 4,
}) {
  const hostname = new URL(supabaseUrl).hostname;
  const references = await collectSupabaseReferences({
    supabaseUrl,
    anonKey,
    fetchImpl,
  });
  const groups = deduplicateReferences(references, hostname);
  if (groups.size !== expectedSourceObjectCount) {
    throw new Error(
      `Expected ${expectedSourceObjectCount} unique Supabase objects, found ${groups.size}`,
    );
  }

  const groupList = [...groups.values()].sort((a, b) =>
    a.objectPath.localeCompare(b.objectPath),
  );
  const downloadedObjects = await mapWithConcurrency(
    groupList,
    concurrency,
    async (group) => {
      const downloaded = await downloadSourceObject({
        sourceUrl: group.sourceUrls[0],
        fetchImpl,
      });
      return {
        buffer: downloaded.buffer,
        manifestObject: {
          objectPath: group.objectPath,
          bytes: downloaded.buffer.length,
          sourceSha256: sha256(downloaded.buffer),
          metadata: downloaded.metadata,
          sourceModes: group.sourceModes,
          sourceUrlFingerprints: group.sourceUrlFingerprints,
          references: group.references,
        },
      };
    },
  );

  return {
    manifest: buildManifest({
      sourceHost: hostname,
      generatedAt,
      objects: downloadedObjects.map((entry) => entry.manifestObject),
      expectedSourceObjectCount,
    }),
    sourceUrlsByObject: new Map(
      groupList.map((group) => [group.objectPath, [...group.sourceUrls]]),
    ),
    sourceBuffersByObject: new Map(
      downloadedObjects.map((entry) => [
        entry.manifestObject.objectPath,
        entry.buffer,
      ]),
    ),
    references,
  };
}
