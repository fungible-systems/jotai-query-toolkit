import deepEqual from 'fast-deep-equal/es6';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { getKeys, makeDebugLabel } from './utils/get-query-key';
import { atomWithInfiniteQuery } from './atom-with-infinite-query';
import { queryKeyCache } from '../utils';
import { setWeakCacheItem } from '../cache';

import type { WritableAtom } from 'jotai';
import type { AtomWithInfiniteQueryAction } from 'jotai/query';
import type { InfiniteData, QueryKey } from 'react-query';
import type {
  AtomFamily,
  AtomFamilyWithInfiniteQueryFn,
  AtomWithInfiniteQueryOptions,
} from './types';
import { QueryKeyOrGetQueryKey } from './types';

export const atomFamilyWithInfiniteQuery = <Param, Data>(
  key: QueryKeyOrGetQueryKey<Param>,
  queryFn: AtomFamilyWithInfiniteQueryFn<Param, Data>,
  options: AtomWithInfiniteQueryOptions<Data> = {}
): AtomFamily<
  Param,
  WritableAtom<InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction<Data>>
> =>
  atomFamily<Param, InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction<Data>>(param => {
    const { queryKeyAtom, ...queryOptions } = options;

    // create our query atom
    const baseAtom = atom(get => {
      const { queryKey } = getKeys<Param>(get, key, param, queryKeyAtom);
      const queryAtom = atomWithInfiniteQuery<Data>(
        queryKey,
        (get, context) => queryFn(get, param, context),
        queryOptions
      );
      queryAtom.debugLabel = makeDebugLabel<Param>(
        'atomFamilyWithInfiniteQuery/queryAtom',
        queryKey,
        param
      );

      return { queryAtom, queryKey };
    });

    // wrapper atom
    const anAtom = atom<InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction<Data>>(
      get => {
        const { queryAtom, queryKey } = get(baseAtom);
        const deps = [anAtom] as const;
        setWeakCacheItem(queryKeyCache, deps, queryKey);
        return get(queryAtom);
      },
      (get, set, action) => set(get(baseAtom).queryAtom, action)
    );
    anAtom.debugLabel = makeDebugLabel<Param>('atomFamilyWithInfiniteQuery', 'TODO:fix', param);

    return anAtom;
  }, deepEqual);
