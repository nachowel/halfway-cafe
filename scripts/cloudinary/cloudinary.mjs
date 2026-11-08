import { createHash } from "node:crypto";

import {
  RetryableHttpError,
  assertCloudinaryPublicId,
  sha256,
  withRetry,
} from "./core.mjs";

const REQUIRED_ENV = Object.freeze([
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
]);

export function getCloudinaryConfig(env = process.env) {
  const missing = REQUIRED_ENV.filter((name) => !env[name]?.trim());
  if (missing.length) {
    return { available: false, missing };
  }
  const config = {
    cloudName: env.CLOUDINARY_CLOUD_NAME.trim(),
    apiKey: env.CLOUDINARY_API_KEY.trim(),
    apiSecret: env.CLOUDINARY_API_SECRET.trim(),
  };
  return {
    available: true,
    config,
    report: {
      available: true,
      cloudName: config.cloudName,
      apiKeyConfigured: true,
      apiSecretConfigured: true,
    },
  };
}

function retryAfter(response) {
  const value = Number(response.headers.get("retry-after"));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

async function cloudinaryAdminRequest(config, path, fetchImpl) {
  const authorization = Buffer.from(
    `${config.apiKey}:${config.apiSecret}`,
    "utf8",
  ).toString("base64");
  return withRetry(async () => {
    const response = await fetchImpl(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}${path}`,
      { headers: { Authorization: `Basic ${authorization}` } },
    );
    if (!response.ok) {
      const message = `Cloudinary Admin API failed with HTTP ${response.status}`;
      if (
        response.status === 408 ||
        response.status === 429 ||
        response.status >= 500
      ) {
        throw new RetryableHttpError(message, response.status, retryAfter(response));
      }
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return response.json();
  });
}

function sanitizeResource(resource) {
  return {
    assetId: resource.asset_id ?? null,
    publicId: resource.public_id,
    version: resource.version ?? null,
    format: resource.format ?? null,
    bytes: resource.bytes ?? null,
    width: resource.width ?? null,
    height: resource.height ?? null,
    context: resource.context ?? null,
  };
}

export async function auditCloudinary({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const configured = getCloudinaryConfig(env);
  if (!configured.available) {
    return {
      available: false,
      missing: configured.missing,
      usage: null,
      productEnvironment: null,
      namespace: null,
    };
  }

  const usage = await cloudinaryAdminRequest(
    configured.config,
    "/usage",
    fetchImpl,
  );
  const productConfig = await cloudinaryAdminRequest(
    configured.config,
    "/config?settings=true",
    fetchImpl,
  );
  const resources = [];
  let cursor = null;
  do {
    const query = new URLSearchParams({
      prefix: "halfway-cafe/",
      max_results: "500",
      context: "true",
    });
    if (cursor) query.set("next_cursor", cursor);
    const page = await cloudinaryAdminRequest(
      configured.config,
      `/resources/image/upload?${query}`,
      fetchImpl,
    );
    for (const resource of page.resources ?? []) {
      if (!resource.public_id?.startsWith("halfway-cafe/")) {
        throw new Error(
          `Cloudinary prefix audit returned an out-of-scope asset: ${resource.public_id}`,
        );
      }
      resources.push(sanitizeResource(resource));
    }
    cursor = page.next_cursor ?? null;
  } while (cursor);

  return {
    ...configured.report,
    usage,
    productEnvironment: {
      cloudName: productConfig.cloud_name ?? configured.config.cloudName,
      folderMode: productConfig.settings?.folder_mode ?? null,
    },
    namespace: {
      prefix: "halfway-cafe/",
      assetCount: resources.length,
      resources,
    },
  };
}

export function buildUploadParameters({
  publicId,
  sourceSha256,
  objectPath,
  timestamp = Math.floor(Date.now() / 1000),
}) {
  assertCloudinaryPublicId(publicId);
  if (!/^[a-f0-9]{64}$/.test(sourceSha256)) {
    throw new Error("Upload source SHA-256 is invalid");
  }
  return {
    context: `source_sha256=${sourceSha256}|source_object_sha256=${sha256(objectPath)}`,
    overwrite: "false",
    public_id: publicId,
    tags: "halfway-cafe,source-supabase",
    timestamp: String(timestamp),
    unique_filename: "false",
  };
}

export function signUploadParameters(parameters, apiSecret) {
  const serialized = Object.entries(parameters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export async function uploadImage({
  config,
  object,
  buffer,
  fetchImpl = fetch,
}) {
  if (!Buffer.isBuffer(buffer) || buffer.length !== object.bytes) {
    throw new Error(`Missing or invalid source buffer for ${object.objectPath}`);
  }
  if (sha256(buffer) !== object.sourceSha256) {
    throw new Error(`Source buffer digest mismatch for ${object.objectPath}`);
  }
  const parameters = buildUploadParameters({
    publicId: object.publicId,
    sourceSha256: object.sourceSha256,
    objectPath: object.objectPath,
  });
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: object.mimeType }), object.objectPath.split("/").at(-1));
  for (const [key, value] of Object.entries(parameters)) form.append(key, value);
  form.append("api_key", config.apiKey);
  form.append("signature", signUploadParameters(parameters, config.apiSecret));

  const response = await fetchImpl(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`,
    { method: "POST", body: form },
  );
  if (!response.ok) {
    const message = `Cloudinary upload failed with HTTP ${response.status}`;
    if (
      response.status === 408 ||
      response.status === 429 ||
      response.status >= 500
    ) {
      throw new RetryableHttpError(message, response.status, retryAfter(response));
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function contextSourceSha256(resource) {
  if (resource?.context?.custom?.source_sha256) {
    return resource.context.custom.source_sha256;
  }
  if (resource?.context?.source_sha256) {
    return resource.context.source_sha256;
  }
  if (typeof resource?.context === "string") {
    const entry = resource.context
      .split("|")
      .map((part) => part.split("="))
      .find(([key]) => key === "source_sha256");
    return entry?.slice(1).join("=") ?? null;
  }
  return null;
}

function normalizedFormat(format) {
  return format === "jpeg" ? "jpg" : format;
}

export function resourceMatchesSource(resource, object) {
  return Boolean(
    resource &&
      resource.public_id === object.publicId &&
      contextSourceSha256(resource) === object.sourceSha256 &&
      Number(resource.bytes) === object.bytes &&
      Number(resource.width) === object.width &&
      Number(resource.height) === object.height &&
      normalizedFormat(resource.format) === normalizedFormat(object.format),
  );
}
