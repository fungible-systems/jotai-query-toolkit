import deepEqual from 'fast-deep-equal/es6';
import { atom } from 'jotai';
import {
  atomWithInfiniteQuery as jotaiAtomWithInfiniteQuery,
  getQueryClientAtom,
} from 'jotai/query';
import { hashQueryKey } from 'react-query';
import { makeQueryKey, queryKeyCache } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { setWeakCacheItem } from '../cache';
import { asInfiniteData } from './utils/as-infinite-data';

import type { AtomWithInfiniteQueryAction } from 'jotai/query';
import type { InfiniteData, QueryKey } from 'react-query';
import type { AtomWithInfiniteQueryFn, AtomWithInfiniteQueryOptions } from './types';
import type { Getter } from 'jotai';

export const atomWithInfiniteQuery = <Data>(
  key: QueryKey,
  queryFn: AtomWithInfiniteQueryFn<Data>,
  options: AtomWithInfiniteQueryOptions<Data> = {}
) => {
  const {
    equalityFn = deepEqual,
    getShouldRefetch,
    queryKeyAtom,
    refetchInterval,
    refetchOnMount = false,
    refetchOnWindowFocus = false,
    refetchOnReconnect = false,
    ...rest
  } = options;

  const getQueryKey = (get: Getter) => {
    if (queryKeyAtom) return makeQueryKey(key, get(queryKeyAtom));
    return makeQueryKey(key);
  };

  const baseAtom = atom(get => {
    const queryKey = getQueryKey(get);
    const hashedQueryKey = hashQueryKey(queryKey);
    const theInitialDataAtom = initialDataAtom(hashedQueryKey);
    const initialData = asInfiniteData(get(theInitialDataAtom) as unknown as Data);

    const shouldRefresh = getShouldRefetch && initialData ? getShouldRefetch(initialData) : true;
    const queryClient = get(getQueryClientAtom);
    const defaultOptions = queryClient.defaultQueryOptions(rest);

    const getRefreshInterval = () => {
      return shouldRefresh
        ? refetchInterval === false
          ? false
          : refetchInterval || QueryRefreshRates.Default
        : false;
    };

    const queryAtom = jotaiAtomWithInfiniteQuery<Data, void, Data, Data>(
      get => ({
        queryKey,
        queryFn: context => queryFn(get, context),
        ...(defaultOptions as any),
        initialData,
        refetchInterval: getRefreshInterval(),
        refetchOnMount: shouldRefresh ? refetchOnMount : false,
        refetchOnWindowFocus: shouldRefresh ? refetchOnWindowFocus : false,
        refetchOnReconnect: shouldRefresh ? refetchOnReconnect : false,
      }),
      equalityFn
    );
    queryAtom.debugLabel = `atomWithInfiniteQuery/queryAtom/${hashedQueryKey}`;

    return {
      queryKey,
      queryAtom,
      initialData,
    };
  });

  const anAtom = atom<InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction>(
    get => {
      const { initialData, queryAtom, queryKey } = get(baseAtom);
      const deps = [anAtom] as const;
      setWeakCacheItem(queryKeyCache, deps, queryKey);
      return IS_SSR ? initialData : get(queryAtom);
    },
    (get, set, action) => set(get(baseAtom).queryAtom, action)
  );
  anAtom.debugLabel = `atomWithInfiniteQuery/${hashQueryKey(makeQueryKey(key))}`;

  return anAtom;
};
