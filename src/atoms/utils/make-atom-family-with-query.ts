import { atomFamilyWithQuery } from '../atom-family-with-query';
import type { QueryKey } from 'react-query';
import type { Scope } from 'jotai/core/atom';
import type { AtomFamilyWithQueryFn, AtomWithQueryRefreshOptions } from '../types';
import { AtomFamily } from '../types';
import { WritableAtom } from 'jotai';
import { AtomWithQueryAction } from 'jotai/query';
import memoize from 'micro-memoize';

const cache = new WeakMap();

interface InitOptions<Param, Data> {
  queryKey: QueryKey;
  queryFn: AtomFamilyWithQueryFn<Param, Data>;
  scope?: Scope;
}

type Return<Param, Data> = AtomFamily<Param, WritableAtom<Data, AtomWithQueryAction>>;

const _makeAtomFamilyWithQuery = <Param, Data>(initOptions: InitOptions<Param, Data>) =>
  memoize((options: AtomWithQueryRefreshOptions<Data> = {}): Return<Param, Data> => {
    const deps = [initOptions, options] as const;
    if (cache.has(deps)) {
      return cache.get(deps);
    }
    const { queryFn, queryKey, scope, ...defaultOptions } = initOptions;
    const anAtom = atomFamilyWithQuery<Param, Data>(queryKey, queryFn, {
      ...defaultOptions,
      ...options,
    });
    cache.set(deps, anAtom);
    return anAtom;
  });

export const makeAtomFamilyWithQuery = memoize(_makeAtomFamilyWithQuery);
