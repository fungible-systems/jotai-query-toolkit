import deepEqual from 'fast-deep-equal';
import { atom, Getter } from 'jotai';
import {
  atomWithInfiniteQuery as jotaiAtomWithInfiniteQuery,
  AtomWithInfiniteQueryAction,
  getQueryClientAtom,
} from 'jotai/query';
import { hashQueryKey, InfiniteData, QueryKey } from 'react-query';
import { makeQueryKey, queryKeyCache } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomWithInfiniteQueryFn, AtomWithInfiniteQueryOptions } from './types';
import { Scope } from 'jotai/core/atom';
import { asInfiniteData } from './atom-family-with-infinite-query';
import { setWeakCacheItem } from '../cache';

export const atomWithInfiniteQuery = <Data>(
  key: QueryKey,
  queryFn: AtomWithInfiniteQueryFn<Data>,
  options: AtomWithInfiniteQueryOptions<Data> = {},
  scope?: Scope
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
    const defaultOptions = queryClient?.getDefaultOptions() || {};
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
        ...defaultOptions,
        initialData,
        ...(rest as any),
        refetchInterval: getRefreshInterval(),
        refetchOnMount: shouldRefresh ? refetchOnMount : false,
        refetchOnWindowFocus: shouldRefresh ? refetchOnWindowFocus : false,
        refetchOnReconnect: shouldRefresh ? refetchOnReconnect : false,
      }),
      equalityFn
    );
    queryAtom.debugLabel = `atomWithInfiniteQuery/queryAtom/${hashedQueryKey}`;
    if (scope) queryAtom.scope = scope;

    return {
      queryKey,
      queryAtom,
      initialData,
    };
  });

  if (scope) baseAtom.scope = scope;

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
  if (scope) anAtom.scope = scope;

  return anAtom;
};
