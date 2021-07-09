import { atomFamilyWithQuery } from '../atom-family-with-query';
import type { QueryKey } from 'react-query';
import type { AtomFamilyWithQueryFn, AtomWithQueryRefreshOptions } from '../types';
import { AtomFamily } from '../types';
import { WritableAtom } from 'jotai';
import { AtomWithQueryAction } from 'jotai/query';

const cache = new WeakMap();

interface InitOptions<Param, Data> {
  queryKey: QueryKey;
  queryFn: AtomFamilyWithQueryFn<Param, Data>;
}

type Return<Param, Data> = AtomFamily<Param, WritableAtom<Data, AtomWithQueryAction>>;

export const makeAtomFamilyWithQuery = <Param, Data>(initOptions: InitOptions<Param, Data>) => {
  if (cache.has(initOptions)) return cache.get(initOptions);
  const fn = (options: AtomWithQueryRefreshOptions<Data> = {}): Return<Param, Data> => {
    const deps = [initOptions, options] as const;
    if (cache.has(deps)) {
      return cache.get(deps);
    }
    const { queryFn, queryKey, ...defaultOptions } = initOptions;
    const anAtom = atomFamilyWithQuery<Param, Data>(queryKey, queryFn, {
      ...defaultOptions,
      ...options,
    });
    cache.set(deps, anAtom);
    return anAtom;
  };
  cache.set(initOptions, fn);
  return fn;
};
