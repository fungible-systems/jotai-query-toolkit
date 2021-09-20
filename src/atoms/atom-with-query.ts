import deepEqual from 'fast-deep-equal/es6';
import { atom, Getter } from 'jotai';
import { atomWithQuery as jotaiAtomWithQuery, AtomWithQueryAction } from 'jotai/query';
import { hashQueryKey, MutateOptions, QueryKey } from 'react-query';
import { makeQueryKey, queryKeyCache } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomWithQueryOptions, AtomWithQueryFn } from './types';
import { setWeakCacheItem } from '../cache';
import { queryKeyObserver } from './react-query/query-key-observer';
import { SetDataOptions } from 'react-query/types/core/query';
import { getQueryClientAtom, queryClientAtom } from './react-query/query-client-atom';

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
  queryOptions: ((get: Getter) => AtomWithQueryOptions<Data>) | AtomWithQueryOptions<Data> = {}
) => {
  const getQueryKey = (get: Getter, queryKeyAtom: any) => {
    if (queryKeyAtom) return makeQueryKey(key, get(queryKeyAtom));
    return makeQueryKey(key);
  };
  const baseAtom = atom(get => {
    const options = typeof queryOptions === 'function' ? queryOptions(get) : queryOptions;

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

    const queryKey = getQueryKey(get, queryKeyAtom);
    const hashedQueryKey = hashQueryKey(queryKey);
    const theInitialDataAtom = initialDataAtom(hashedQueryKey);
    const initialData = get(theInitialDataAtom) as unknown as Data;

    const shouldRefresh = getShouldRefetch && initialData ? getShouldRefetch(initialData) : true;
    const queryClient = get(queryClientAtom);

    const getRefreshInterval = () => {
      return shouldRefresh
        ? refetchInterval === false
          ? false
          : refetchInterval || QueryRefreshRates.Default
        : false;
    };

    const defaultOptions = queryClient.defaultQueryOptions({
      ...rest,
      refetchInterval: getRefreshInterval(),
      refetchOnMount: shouldRefresh ? refetchOnMount : false,
      refetchOnWindowFocus: shouldRefresh ? refetchOnWindowFocus : false,
      refetchOnReconnect: shouldRefresh ? refetchOnReconnect : false,
      initialData,
    });

    const queryAtom = jotaiAtomWithQuery<Data, void, Data, Data>(
      get => ({
        queryKey,
        queryFn: () => queryFn(get),
        ...defaultOptions,
      }),
      getQueryClientAtom
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
          const queryClient = getQueryClientAtom(get);
          void queryClient
            .getQueryCache()
            .find(queryKey)
            ?.setData(action.payload.data, action.payload.options);
          break;
        }
        case 'mutate': {
          const queryClient = getQueryClientAtom(get);
          void queryClient.executeMutation(action.payload);
          break;
        }
      }
    }
  );
  anAtom.debugLabel = `atomWithQuery/${hashQueryKey(makeQueryKey(key))}`;

  return anAtom;
};
