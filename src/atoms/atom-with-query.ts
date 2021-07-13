import deepEqual from 'fast-deep-equal/es6';
import { atom, Getter } from 'jotai';
import {
  atomWithQuery as jotaiAtomWithQuery,
  AtomWithQueryAction,
  getQueryClientAtom,
} from 'jotai/query';
import { hashQueryKey, MutateOptions, QueryKey } from 'react-query';
import { makeQueryKey, queryKeyCache } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomWithQueryOptions, AtomWithQueryFn } from './types';
import { setWeakCacheItem } from '../cache';
import { queryKeyObserver } from './react-query/query-key-observer';
import { SetDataOptions } from 'react-query/types/core/query';

export type JQTAtomWithQueryActions<Data> =
  | AtomWithQueryAction
  | {
      type: 'setQueryData';
      payload: {
        data: Data;
        options?: SetDataOptions;
      };
    }
  | { type: 'mutate'; payload: MutateOptions<Data> };

export const atomWithQuery = <Data>(
  key: QueryKey,
  queryFn: AtomWithQueryFn<Data>,
  options: AtomWithQueryOptions<Data> = {}
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
    const defaultOptions = queryClient.defaultQueryOptions(rest);

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
        refetchInterval: getRefreshInterval(),
        refetchOnMount: shouldRefresh ? refetchOnMount : false,
        refetchOnWindowFocus: shouldRefresh ? refetchOnWindowFocus : false,
        refetchOnReconnect: shouldRefresh ? refetchOnReconnect : false,
        initialData,
      }),
      equalityFn
    );
    queryAtom.debugLabel = `atomWithQuery/queryAtom/${hashedQueryKey}`;

    return {
      queryKey,
      queryAtom,
      initialData,
    };
  });

  const anAtom = atom<Data, JQTAtomWithQueryActions<Data>>(
    get => {
      const { initialData, queryAtom, queryKey } = get(baseAtom);
      const deps = [anAtom] as const;
      setWeakCacheItem(queryKeyCache, deps, queryKey);
      return IS_SSR ? initialData : get(queryAtom);
    },
    (get, set, action) => {
      const { queryKey } = get(baseAtom);

      switch (action.type) {
        case 'refetch': {
          const observer = get(queryKeyObserver(queryKey));
          void observer.refetch();
          break;
        }
        case 'setQueryData': {
          const queryClient = get(getQueryClientAtom);
          void queryClient
            .getQueryCache()
            .find(queryKey)
            ?.setData(action.payload.data, action.payload.options);
          break;
        }
        case 'mutate': {
          const queryClient = get(getQueryClientAtom);
          void queryClient.executeMutation(action.payload);
          break;
        }
      }
    }
  );
  anAtom.debugLabel = `atomWithQuery/${hashQueryKey(makeQueryKey(key))}`;

  return anAtom;
};
