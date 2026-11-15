import assert from "node:assert/strict";
import { test } from "node:test";

import { createLiveDataFetch } from "./live-public-fetch.ts";

test("live data fetch preserves existing options while forcing no-store", async () => {
  const calls = [];
  const response = new Response(null, { status: 204 });
  const baseFetch = async (input, init) => {
    calls.push({ input, init });
    return response;
  };
  const liveFetch = createLiveDataFetch(baseFetch);
  const input = new Request("https://example.test/rest/v1/menu_items");
  const headers = new Headers({ authorization: "Bearer public-test-token" });
  const signal = new AbortController().signal;
  const nextOptions = { tags: ["menu-test"] };

  const result = await liveFetch(input, {
    method: "POST",
    headers,
    body: "payload",
    credentials: "omit",
    redirect: "manual",
    signal,
    cache: "force-cache",
    next: nextOptions,
  });

  assert.strictEqual(result, response);
  assert.equal(calls.length, 1);
  assert.strictEqual(calls[0].input, input);
  assert.deepEqual(calls[0].init, {
    method: "POST",
    headers,
    body: "payload",
    credentials: "omit",
    redirect: "manual",
    signal,
    cache: "no-store",
    next: nextOptions,
  });
});

test("live data fetch applies no-store when no request options are supplied", async () => {
  const calls = [];
  const baseFetch = async (input, init) => {
    calls.push({ input, init });
    return new Response(null, { status: 204 });
  };
  const liveFetch = createLiveDataFetch(baseFetch);

  await liveFetch("https://example.test/rest/v1/categories");
  await liveFetch("https://example.test/rest/v1/categories");

  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map(({ init }) => init), [
    { cache: "no-store" },
    { cache: "no-store" },
  ]);
});
