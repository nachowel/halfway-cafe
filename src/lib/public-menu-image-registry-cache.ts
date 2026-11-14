type CacheFunction = <Arguments extends unknown[], Result>(
  callback: (...arguments_: Arguments) => Result,
) => (...arguments_: Arguments) => Result;

type RegistryLookup<Result> = (publicId: string) => Promise<Result>;

export function createRequestScopedRegistryLookup<Result>(
  cacheFunction: CacheFunction,
  load: RegistryLookup<Result>,
): RegistryLookup<Result> {
  return cacheFunction(load);
}
