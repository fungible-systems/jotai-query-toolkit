import deepEqual from 'fast-deep-equal';
import { atom, Getter, WritableAtom } from 'jotai';
import {
  atomWithInfiniteQuery,
  AtomWithInfiniteQueryAction,
  getQueryClientAtom,
} from 'jotai/query';
import { atomFamily } from 'jotai/utils';
import { hashQueryKey, InfiniteData, QueryKey } from 'react-query';
import { makeQueryKey, queryKeyCache } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomFamily, AtomFamilyWithInfiniteQueryFn, AtomWithInfiniteQueryOptions } from './types';
import { Scope } from 'jotai/core/atom';
import { setWeakCacheItem } from '../cache';

export function asInfiniteData<Data>(data: Data): InfiniteData<Data> {
  if (data && 'pages' in data && 'pageParams' in data) return data as unknown as InfiniteData<Data>;
  return {
    pages: [data],
    pageParams: [undefined],
  };
}

export const atomFamilyWithInfiniteQuery = <Param, Data>(
  key: QueryKey,
  queryFn: AtomFamilyWithInfiniteQueryFn<Param, Data>,
  options: AtomWithInfiniteQueryOptions<Data> = {},
  scope?: Scope
): AtomFamily<Param, WritableAtom<InfiniteData<Data>, AtomWithInfiniteQueryAction>> => {
  const {
    equalityFn = deepEqual,
    getShouldRefetch,
    queryKeyAtom,
    refetchInterval,
    ...rest
  } = options;

  return atomFamily<Param, InfiniteData<Data>, AtomWithInfiniteQueryAction>(param => {
    const getQueryKey = (get: Getter) => {
      if (queryKeyAtom) return makeQueryKey(key, [param, get(queryKeyAtom)]);
      return makeQueryKey(key, param);
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

      const queryAtom = atomWithInfiniteQuery<Data, void, Data, Data>(
        get => ({
          queryKey,
          queryFn: context => queryFn(get, param, context),
          ...defaultOptions,
          initialData,
          refetchInterval: getRefreshInterval(),
          ...(rest as any),
        }),
        equalityFn
      );
      queryAtom.debugLabel = `atomFamilyWithInfiniteQuery/queryAtom/${hashedQueryKey}`;
      if (scope) queryAtom.scope = scope;

      return {
        queryKey,
        queryAtom,
        initialData,
      };
    });
    if (scope) baseAtom.scope = scope;

    const anAtom = atom<InfiniteData<Data>, AtomWithInfiniteQueryAction>(
      get => {
        const { initialData, queryAtom, queryKey } = get(baseAtom);
        const deps = [anAtom] as const;
        setWeakCacheItem(queryKeyCache, deps, queryKey);
        return IS_SSR ? initialData : get(queryAtom);
      },
      (get, set, action) => set(get(baseAtom).queryAtom, action)
    );
    anAtom.debugLabel = `atomFamilyWithInfiniteQuery/${hashQueryKey(makeQueryKey(key, param))}`;
    if (scope) anAtom.scope = scope;

    return anAtom;
  }, deepEqual);
};
