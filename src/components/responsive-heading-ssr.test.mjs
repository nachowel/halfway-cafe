import assert from "node:assert/strict";
import { test } from "node:test";

const baseUrl = process.env.BASE_URL;

if (!baseUrl) {
  throw new Error("BASE_URL is required for responsive heading SSR tests.");
}

async function fetchHtml(pathname) {
  const response = await fetch(new URL(pathname, baseUrl));
  assert.equal(response.status, 200, `${pathname} should return HTTP 200`);
  return response.text();
}

function countH1Elements(html) {
  return [...html.matchAll(/<h1\b/gi)].length;
}

test("responsive home and menu routes render exactly one SSR H1", async () => {
  const menuHtml = await fetchHtml("/menu");
  const discoveredCategoryRoutes = [
    ...menuHtml.matchAll(/href="(\/menu\/[a-z0-9-]+)"/gi),
  ].map((match) => match[1]);
  const routes = [
    "/",
    "/menu",
    "/menu/drinks",
    "/menu/breakfast",
    ...discoveredCategoryRoutes,
  ].filter((route, index, allRoutes) => allRoutes.indexOf(route) === index);

  const results = await Promise.all(
    routes.map(async (route) => ({ route, html: await fetchHtml(route) })),
  );

  for (const { route, html } of results) {
    assert.equal(
      countH1Elements(html),
      1,
      `${route} should contain exactly one server-rendered H1`,
    );
  }
});
