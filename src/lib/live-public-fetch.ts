type FetchImplementation = typeof fetch;

export function createLiveDataFetch(
  fetchImplementation: FetchImplementation,
): FetchImplementation {
  return (input, init) =>
    fetchImplementation(input, {
      ...init,
      cache: "no-store",
    });
}
