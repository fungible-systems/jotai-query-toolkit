import { atomWithQuery } from '../atom-with-query';
import type { AtomWithQueryRefreshOptions, AtomWithQueryFn } from '../types';
import type { QueryKey } from 'react-query';

const cache = new WeakMap();
export const makeAtomWithQuery = <Data>(initOptions: {
  queryKey: QueryKey;
  queryFn: AtomWithQueryFn<Data>;
}) => {
  if (cache.has(initOptions)) return cache.get(initOptions);
  const fn = (options: AtomWithQueryRefreshOptions<Data> = {}) =>
    atomWithQuery<Data>(initOptions.queryKey, initOptions.queryFn, options);
  cache.set(initOptions, fn);
  return fn;
};
