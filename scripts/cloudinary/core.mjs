import { createHash } from "node:crypto";

export const CLOUDINARY_PREFIX = "halfway-cafe/";
export const RESPONSIVE_WIDTHS = Object.freeze([
  96, 192, 256, 384, 640, 828, 1080, 1376, 1600,
]);

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sortForCanonicalJson(value) {
  if (Array.isArray(value)) {
    return value.map(sortForCanonicalJson);
  }
  if (value && typeof value === "object" && !Buffer.isBuffer(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortForCanonicalJson(value[key])]),
    );
  }
  return value;
}

export function canonicalStringify(value) {
  return JSON.stringify(sortForCanonicalJson(value));
}

export function redactUrl(value) {
  try {
    const url = new URL(value);
    return url.search ? `${url.origin}${url.pathname}?<redacted>` : url.href;
  } catch {
    return "<invalid-url>";
  }
}

export function normalizeSupabaseStorageUrl(value, expectedHostname) {
  const url = new URL(value);
  if (expectedHostname && url.hostname !== expectedHostname) {
    throw new Error(`Unexpected Supabase host: ${url.hostname}`);
  }

  const match = url.pathname.match(
    /^\/storage\/v1\/object\/(sign|public)\/(.+)$/,
  );
  if (!match) {
    throw new Error(`Not a supported Supabase Storage URL: ${redactUrl(value)}`);
  }

  const objectPath = match[2]
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  const slash = objectPath.indexOf("/");
  if (slash < 1 || slash === objectPath.length - 1) {
    throw new Error(`Supabase object URL lacks bucket or path: ${redactUrl(value)}`);
  }

  return {
    host: url.hostname,
    bucket: objectPath.slice(0, slash),
    path: objectPath.slice(slash + 1),
    objectPath,
    mode: match[1] === "sign" ? "signed" : "public",
    hasQuery: url.search.length > 0,
    sourceUrlFingerprint: sha256(value),
  };
}

function safeSegment(value) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  if (!normalized) {
    throw new Error(`Object path segment cannot be normalized safely: ${value}`);
  }
  return normalized;
}

export function createPublicId(objectPath, sourceSha256) {
  if (!/^[a-f0-9]{64}$/.test(sourceSha256)) {
    throw new Error("Source SHA-256 must be a lowercase 64-character digest");
  }
  const rawSegments = objectPath.split("/").filter(Boolean);
  if (rawSegments.length < 2) {
    throw new Error(`Object path must include a bucket and file: ${objectPath}`);
  }
  const last = rawSegments.at(-1).replace(/\.[^.]+$/, "");
  const segments = [
    ...rawSegments.slice(0, -1).map(safeSegment),
    `${safeSegment(last)}--${sourceSha256.slice(0, 12)}`,
  ];
  const publicId = `${CLOUDINARY_PREFIX}${segments.join("/")}`;
  assertCloudinaryPublicId(publicId);
  return publicId;
}

export function assertCloudinaryPublicId(publicId) {
  if (!publicId.startsWith(CLOUDINARY_PREFIX)) {
    throw new Error(`Cloudinary public ID must use the ${CLOUDINARY_PREFIX} prefix`);
  }
  if (
    publicId.length > 255 ||
    /[?&#\\%<>+]/.test(publicId) ||
    publicId.endsWith("/") ||
    publicId.includes("//")
  ) {
    throw new Error(`Unsafe Cloudinary public ID: ${publicId}`);
  }
  return publicId;
}

function inspectPng(buffer) {
  if (
    buffer.length >= 24 &&
    buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) &&
    buffer.toString("ascii", 12, 16) === "IHDR"
  ) {
    return {
      format: "png",
      mimeType: "image/png",
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }
  return null;
}

function inspectJpeg(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }
  let offset = 2;
  const sofMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
    0xce, 0xcf,
  ]);
  while (offset + 3 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 1 >= buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if (sofMarkers.has(marker) && length >= 7) {
      return {
        format: "jpg",
        mimeType: "image/jpeg",
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
      };
    }
    offset += length;
  }
  throw new Error("Unsupported or incomplete JPEG image data");
}

function inspectWebp(buffer) {
  if (
    buffer.length < 20 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return null;
  }
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (data + size > buffer.length) break;
    if (type === "VP8X" && size >= 10) {
      return {
        format: "webp",
        mimeType: "image/webp",
        width: buffer.readUIntLE(data + 4, 3) + 1,
        height: buffer.readUIntLE(data + 7, 3) + 1,
      };
    }
    if (
      type === "VP8 " &&
      size >= 10 &&
      buffer[data + 3] === 0x9d &&
      buffer[data + 4] === 0x01 &&
      buffer[data + 5] === 0x2a
    ) {
      return {
        format: "webp",
        mimeType: "image/webp",
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
      };
    }
    if (type === "VP8L" && size >= 5 && buffer[data] === 0x2f) {
      const bits = buffer.readUInt32LE(data + 1);
      return {
        format: "webp",
        mimeType: "image/webp",
        width: (bits & 0x3fff) + 1,
        height: ((bits >>> 14) & 0x3fff) + 1,
      };
    }
    offset = data + size + (size % 2);
  }
  throw new Error("Unsupported or incomplete WebP image data");
}

function inspectAvif(buffer) {
  if (
    buffer.length < 32 ||
    buffer.toString("ascii", 4, 8) !== "ftyp"
  ) {
    return null;
  }
  const compatibleBrands = buffer.subarray(8, Math.min(buffer.length, 64));
  if (
    !compatibleBrands.includes(Buffer.from("avif")) &&
    !compatibleBrands.includes(Buffer.from("avis"))
  ) {
    return null;
  }
  let offset = 0;
  while (offset + 20 <= buffer.length) {
    const index = buffer.indexOf("ispe", offset, "ascii");
    if (index < 4 || index + 16 > buffer.length) break;
    const boxSize = buffer.readUInt32BE(index - 4);
    if (boxSize >= 20 && index - 4 + boxSize <= buffer.length) {
      return {
        format: "avif",
        mimeType: "image/avif",
        width: buffer.readUInt32BE(index + 8),
        height: buffer.readUInt32BE(index + 12),
      };
    }
    offset = index + 4;
  }
  throw new Error("Unsupported or incomplete AVIF image data");
}

export function inspectImage(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("Image input must be a Buffer");
  }
  const metadata =
    inspectPng(buffer) ??
    inspectJpeg(buffer) ??
    inspectWebp(buffer) ??
    inspectAvif(buffer);
  if (!metadata || metadata.width < 1 || metadata.height < 1) {
    throw new Error("Unsupported or incomplete image data");
  }
  return metadata;
}

export class RetryableHttpError extends Error {
  constructor(message, status, retryAfterSeconds = null) {
    super(message);
    this.name = "RetryableHttpError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
    this.retryable = true;
  }
}

export function isRetryableError(error) {
  if (error?.retryable === true) return true;
  if (error?.name === "AbortError") return true;
  if (
    ["ECONNRESET", "ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH", "ETIMEDOUT"].includes(
      error?.code,
    )
  ) {
    return true;
  }
  if (error instanceof TypeError && error?.status == null) return true;
  const status = Number(error?.status);
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

export async function withRetry(operation, options = {}) {
  const {
    maxAttempts = 5,
    baseDelayMs = 250,
    sleep = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
    random = Math.random,
  } = options;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw error;
      }
      const retryAfterMs = Number.isFinite(error.retryAfterSeconds)
        ? error.retryAfterSeconds * 1000
        : null;
      const exponential = baseDelayMs * 2 ** (attempt - 1);
      const jitter = Math.floor(baseDelayMs * random());
      await sleep(retryAfterMs ?? exponential + jitter);
    }
  }
  throw lastError;
}

export function buildCloudinaryDeliveryUrl({
  cloudName,
  publicId,
  version,
  format,
  width,
}) {
  assertCloudinaryPublicId(publicId);
  if (!RESPONSIVE_WIDTHS.includes(width)) {
    throw new Error(`Width ${width} is not in the finite responsive width set`);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName)) {
    throw new Error("Invalid Cloudinary cloud name");
  }
  if (!Number.isInteger(Number(version)) || Number(version) < 1) {
    throw new Error("Cloudinary version must be a positive integer");
  }
  if (!/^[a-z0-9]+$/i.test(format)) {
    throw new Error("Invalid Cloudinary image format");
  }
  const encodedPublicId = publicId.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_${width}/f_auto/q_auto/v${version}/${encodedPublicId}.${format}`;
}
