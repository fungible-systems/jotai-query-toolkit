import type { WritableAtom } from 'jotai';

export type WeakCache<T> = WeakMap<object, [WeakCache<T>] | [WeakCache<T>, T]>;
export type Cache<T> = WeakMap<object, T>;

export const makeWeakCache = <T>(): WeakCache<T> => new WeakMap();

export const getCacheItem = <T>(cache: Cache<T>, dep: object): T | undefined => {
  const entry = cache.get(dep);
  if (entry) return entry;
};
export const setCacheItem = <T>(cache: Cache<T>, dep: object, item: T): void => {
  if (!cache.get(dep as object)) cache.set(dep as object, item as T);
};

export const getWeakCacheItem = <T>(
  cache: WeakCache<T>,
  deps: readonly object[]
): T | undefined => {
  while (true) {
    const [dep, ...rest] = deps;
    const entry = cache.get(dep as object);
    if (!entry) {
      return;
    }
    if (!rest.length) {
      return entry[1];
    }
    cache = entry[0];
    deps = rest;
  }
};

export const setWeakCacheItem = <T>(
  cache: WeakCache<T>,
  deps: readonly object[],
  item: T
): void => {
  while (true) {
    const [dep, ...rest] = deps;
    let entry = cache.get(dep as object);
    if (!entry) {
      entry = [new WeakMap()];
      cache.set(dep as object, entry);
    }
    if (!rest.length) {
      entry[1] = item;
      return;
    }
    cache = entry[0];
    deps = rest;
  }
};

export const createMemoizeAtom = <Data = unknown, Write = unknown>() => {
  const cache: WeakCache<WritableAtom<Data, Write>> = new WeakMap();
  const memoizeAtom = <AtomType extends WritableAtom<Data, Write>, Deps extends readonly object[]>(
    createAtom: () => AtomType,
    deps: Deps
  ) => {
    const cachedAtom = getWeakCacheItem(cache, deps);
    if (cachedAtom) {
      return cachedAtom as AtomType;
    }
    const createdAtom = createAtom();
    setWeakCacheItem(cache, deps, createdAtom);
    return createdAtom;
  };
  return memoizeAtom;
};
