type CacheFunction = <Arguments extends unknown[], Result>(
  callback: (...arguments_: Arguments) => Result,
) => (...arguments_: Arguments) => Result;

type AsyncLoader<Arguments extends unknown[], Result> = (
  ...arguments_: Arguments
) => Promise<Result>;

export function createRequestScopedMenuDataLoader<
  Arguments extends unknown[],
  Result,
>(
  cacheFunction: CacheFunction,
  load: AsyncLoader<Arguments, Result>,
): AsyncLoader<Arguments, Result> {
  return cacheFunction(load);
}
