import deepEqual from 'fast-deep-equal';
import { atom, Getter } from 'jotai';
import {
  atomWithQuery as jotaiAtomWithQuery,
  AtomWithQueryAction,
  getQueryClientAtom,
} from 'jotai/query';
import { hashQueryKey, QueryKey } from 'react-query';
import { makeQueryKey, queryKeyCache } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomWithQueryRefreshOptions, AtomWithQueryFn } from './types';
import { Scope } from 'jotai/core/atom';
import { setWeakCacheItem } from '../cache';

export const atomWithQuery = <Data>(
  key: QueryKey,
  queryFn: AtomWithQueryFn<Data>,
  options: AtomWithQueryRefreshOptions<Data> = {},
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
    const initialData = get(theInitialDataAtom) as unknown as Data;
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

    const queryAtom = jotaiAtomWithQuery<Data, void, Data, Data>(
      get => ({
        queryKey,
        queryFn: () => queryFn(get),
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
    queryAtom.debugLabel = `atomWithQuery/queryAtom/${hashedQueryKey}`;
    if (scope) queryAtom.scope = scope;

    return {
      queryKey,
      queryAtom,
      initialData,
    };
  });

  if (scope) baseAtom.scope = scope;

  const anAtom = atom<Data, AtomWithQueryAction>(
    get => {
      const { initialData, queryAtom, queryKey } = get(baseAtom);
      const deps = [anAtom] as const;
      setWeakCacheItem(queryKeyCache, deps, queryKey);
      return IS_SSR ? initialData : get(queryAtom);
    },
    (get, set, action) => set(get(baseAtom).queryAtom, action)
  );
  anAtom.debugLabel = `atomWithQuery/${hashQueryKey(makeQueryKey(key))}`;
  if (scope) anAtom.scope = scope;

  return anAtom;
};
