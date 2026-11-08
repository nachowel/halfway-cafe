import test from "node:test";
import assert from "node:assert/strict";

import { createPublicImageResolver, signCloudinaryDeliveryPath } from "./public-image-core.ts";
import type { CloudinaryAssetMapping } from "../types/public-image.ts";

const mapping: CloudinaryAssetMapping = {
  schemaVersion: 1,
  manifestSha256: "a".repeat(64),
  sourceHost: "project.supabase.co",
  assets: [{
    objectPath: "Hero/hero1.png",
    publicId: "halfway-cafe/hero/hero1--a770d412c9c0",
    version: 1234,
    format: "png",
    width: 1024,
    height: 768,
  }],
};

const resolve = createPublicImageResolver({
  mapping,
  cloudName: "shared-cloud",
  apiSecret: "test-secret",
});

test("matches the approved SHA-256 Cloudinary delivery signature vector", () => {
  assert.equal(
    signCloudinaryDeliveryPath(
      "c_limit,w_828/f_auto/q_auto/v1234/halfway-cafe/hero/hero1--a770d412c9c0.png",
      "test-secret",
    ),
    "1T99h5Wk",
  );
});

test("maps Supabase references to deterministic signed WebP delivery without automatic format negotiation", () => {
  const signed = resolve(
    "https://project.supabase.co/storage/v1/object/sign/Hero/hero1.png?token=private-value",
    "hero",
  );
  const publicReference = resolve(
    "https://project.supabase.co/storage/v1/object/public/Hero/hero1.png",
    "hero",
  );

  assert.deepEqual(signed, publicReference);
  assert.equal(
    signed?.src,
    "https://res.cloudinary.com/shared-cloud/image/upload/s--Y6ybEK7w--/c_limit,w_1024/q_auto/f_webp/v1234/halfway-cafe/hero/hero1--a770d412c9c0.png",
  );
  assert.deepEqual(signed?.widths, [96, 192, 256, 384, 640, 828, 1024]);
  assert.equal(signed?.width, 1024);
  assert.equal(signed?.height, 768);
  assert.equal(signed?.provider, "cloudinary");
  assert.match(signed?.srcSet ?? "", /q_auto\/f_webp/);
  assert.equal((signed?.srcSet ?? "").includes("f_auto"), false);
  assert.equal((signed?.srcSet ?? "").includes("token="), false);
  assert.equal((signed?.srcSet ?? "").includes("\/_next\/image"), false);
});

test("uses role targets without inventing widths outside the approved lattice", () => {
  assert.match(resolve("Hero/hero1.png", "logo")?.src ?? "", /w_192/);
  assert.match(resolve("Hero/hero1.png", "thumbnail")?.src ?? "", /w_384/);
  assert.match(resolve("Hero/hero1.png", "card")?.src ?? "", /w_828/);
  assert.match(resolve("Hero/hero1.png", "content")?.src ?? "", /w_1024/);
  assert.match(resolve("Hero/hero1.png", "hero")?.src ?? "", /w_1024/);
});

test("caps candidate widths at intrinsic width and includes the intrinsic endpoint", () => {
  const smallResolver = createPublicImageResolver({
    mapping: {
      ...mapping,
      assets: [{ ...mapping.assets[0], width: 221, height: 180 }],
    },
    cloudName: "shared-cloud",
    apiSecret: "test-secret",
  });
  assert.deepEqual(smallResolver("Hero/hero1.png", "hero")?.widths, [96, 192, 221]);

  const largeResolver = createPublicImageResolver({
    mapping: {
      ...mapping,
      assets: [{ ...mapping.assets[0], width: 1792, height: 1024 }],
    },
    cloudName: "shared-cloud",
    apiSecret: "test-secret",
  });
  assert.deepEqual(largeResolver("Hero/hero1.png", "hero")?.widths, [
    96, 192, 256, 384, 640, 828, 1080, 1376, 1600,
  ]);
});

test("generates direct deterministic Unsplash responsive URLs", () => {
  const source = "https://images.unsplash.com/photo-123?ixlib=rb-4.1.0&w=999&q=60";
  const image = resolve(source, "card");
  assert.equal(image?.provider, "unsplash");
  assert.match(image?.src ?? "", /^https:\/\/images\.unsplash\.com\/photo-123\?/);
  assert.match(image?.src ?? "", /w=828/);
  assert.match(image?.src ?? "", /fm=auto/);
  assert.match(image?.src ?? "", /q=80/);
  assert.equal((image?.src ?? "").includes("/_next/image"), false);
  assert.equal(resolve(source, "card")?.srcSet, image?.srcSet);
});

test("sanitizes unknown signed Supabase references to query-free public URLs", () => {
  const image = resolve(
    "https://project.supabase.co/storage/v1/object/sign/legacy/unknown%20image.jpg?token=secret#fragment",
    "card",
  );
  assert.deepEqual(image, {
    src: "https://project.supabase.co/storage/v1/object/public/legacy/unknown%20image.jpg",
    provider: "supabase",
  });
});

test("passes unknown external and local images through without Vercel optimization", () => {
  assert.deepEqual(resolve("https://cdn.example.com/image.jpg?x=1", "card"), {
    src: "https://cdn.example.com/image.jpg?x=1",
    provider: "external",
  });
  assert.deepEqual(resolve("/images/fallback.webp", "card"), {
    src: "/images/fallback.webp",
    provider: "local",
  });
});

test("returns null for missing input and rejects malformed mapping entries", () => {
  assert.equal(resolve(null, "card"), null);
  assert.equal(resolve("", "card"), null);
  assert.throws(
    () => createPublicImageResolver({
      mapping: { ...mapping, assets: [{ ...mapping.assets[0], publicId: "unsafe/id" }] },
      cloudName: "shared-cloud",
      apiSecret: "test-secret",
    }),
    /namespace/i,
  );
});
