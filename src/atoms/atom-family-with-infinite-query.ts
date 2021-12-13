import deepEqual from 'fast-deep-equal/es6';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { getKeys } from './utils/get-query-key';
import { atomWithInfiniteQuery } from './atom-with-infinite-query';
import { queryKeyCache } from '../utils';
import { setCacheItem } from '../cache';

import type { WritableAtom, Getter } from 'jotai';
import type { AtomWithInfiniteQueryAction } from 'jotai/query';
import type { InfiniteData } from 'react-query';
import type {
  AtomFamily,
  AtomFamilyWithInfiniteQueryFn,
  AtomWithInfiniteQueryOptions,
} from './types';
import type { QueryKeyOrGetQueryKey } from './types';

export const atomFamilyWithInfiniteQuery = <Param, Data>(
  key: QueryKeyOrGetQueryKey<Param>,
  queryFn: AtomFamilyWithInfiniteQueryFn<Param, Data>,
  options:
    | AtomWithInfiniteQueryOptions<Data>
    | ((param: Param, get: Getter) => AtomWithInfiniteQueryOptions<Data>) = {}
): AtomFamily<
  Param,
  WritableAtom<InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction<Data>>
> =>
  atomFamily<Param, InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction<Data>>(param => {
    // create our query atom
    const baseAtom = atom(get => {
      if (typeof options === 'function') options = options(param, get);
      const { queryKeyAtom, ...queryOptions } = options;
      const { queryKey } = getKeys<Param>(get, key, param, queryKeyAtom);
      const queryAtom = atomWithInfiniteQuery<Data>(
        queryKey,
        (get, context) => queryFn(get, param, context),
        queryOptions
      );
      return { queryAtom, queryKey };
    });

    // wrapper atom
    const anAtom = atom<InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction<Data>>(
      get => {
        const { queryAtom, queryKey } = get(baseAtom);
        setCacheItem(queryKeyCache, anAtom, queryKey);
        return get(queryAtom);
      },
      (get, set, action) => set(get(baseAtom).queryAtom, action)
    );
    return anAtom;
  }, deepEqual);
