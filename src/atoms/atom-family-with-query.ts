import deepEqual from 'fast-deep-equal/es6';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { queryKeyCache } from '../utils';
import { atomWithQuery } from './atom-with-query';
import { setWeakCacheItem } from '../cache';
import { getKeys, makeDebugLabel } from './utils/get-query-key';
import type { JQTAtomWithQueryActions } from './atom-with-query';
import type { AtomFamilyWithQueryFn, AtomWithQueryOptions, QueryKeyOrGetQueryKey } from './types';

export const atomFamilyWithQuery = <Param, Data, Error = void, TQueryData = Data>(
  key: QueryKeyOrGetQueryKey<Param>,
  queryFn: AtomFamilyWithQueryFn<Param, Data>,
  options: AtomWithQueryOptions<Data> | ((param: Param) => AtomWithQueryOptions<Data>) = {}
) =>
  atomFamily<Param, Data, JQTAtomWithQueryActions<Data>>(param => {
    if (typeof options === 'function') options = options(param);

    const { queryKeyAtom, ...queryOptions } = options;

    // create our query atom
    const baseAtom = atom(get => {
      const { queryKey } = getKeys<Param>(get, key, param, queryKeyAtom);
      const queryAtom = atomWithQuery<Data>(queryKey, get => queryFn(get, param), queryOptions);
      queryAtom.debugLabel = makeDebugLabel<Param>(
        'atomFamilyWithQuery/queryAtom',
        queryKey,
        param
      );

      return { queryAtom, queryKey };
    });

    // wrapper atom
    const anAtom = atom<Data, JQTAtomWithQueryActions<Data>>(
      get => {
        const { queryAtom, queryKey } = get(baseAtom);
        const deps = [anAtom] as const;
        setWeakCacheItem(queryKeyCache, deps, queryKey);
        return get(queryAtom);
      },
      (get, set, action) => set(get(baseAtom).queryAtom, action)
    );
    anAtom.debugLabel = makeDebugLabel<Param>('atomFamilyWithQuery', 'TODO:fix', param);

    return anAtom;
  }, deepEqual);
