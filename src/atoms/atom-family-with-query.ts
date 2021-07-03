import deepEqual from 'fast-deep-equal';
import { atom, Getter } from 'jotai';
import { atomWithQuery, AtomWithQueryAction, getQueryClientAtom } from 'jotai/query';
import { atomFamily } from 'jotai/utils';
import { hashQueryKey, QueryKey } from 'react-query';
import { makeQueryKey, queryKeyCache } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomFamilyWithQueryFn, AtomWithQueryRefreshOptions } from './types';
import { Scope } from 'jotai/core/atom';
import { setWeakCacheItem } from '../cache';

export const atomFamilyWithQuery = <Param, Data, Error = void, TQueryData = Data>(
  key: QueryKey,
  queryFn: AtomFamilyWithQueryFn<Param, Data>,
  options: AtomWithQueryRefreshOptions<Data> = {},
  scope?: Scope
) => {
  const {
    equalityFn = deepEqual,
    getShouldRefetch,
    queryKeyAtom,
    refetchInterval,
    ...rest
  } = options;

  return atomFamily<Param, Data>(param => {
    const getQueryKey = (get: Getter) => {
      if (queryKeyAtom) return makeQueryKey(key, [param, get(queryKeyAtom)]);
      return makeQueryKey(key, param);
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

      const queryAtomOptions = (get: Getter) => ({
        queryKey,
        queryFn: () => queryFn(get, param),
        ...defaultOptions,
        initialData,
        refetchInterval: getRefreshInterval(),
        ...(rest as any),
      });

      const queryAtom = atomWithQuery<Data, void, Data, Data>(queryAtomOptions, equalityFn);
      queryAtom.debugLabel = `atomFamilyWithQuery/queryAtom/${hashedQueryKey}`;
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
    anAtom.debugLabel = `atomFamilyWithQuery/${hashQueryKey(makeQueryKey(key, param))}`;
    if (scope) anAtom.scope = scope;

    return anAtom;
  }, deepEqual);
};
