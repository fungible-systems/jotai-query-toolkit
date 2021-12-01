import deepEqual from 'fast-deep-equal/es6';
import { atom, Getter } from 'jotai';
import { atomWithQuery as jotaiAtomWithQuery, AtomWithQueryAction } from 'jotai/query';
import { hashQueryKey, MutateOptions, QueryKey, SetDataOptions } from 'react-query';
import { makeQueryKey, queryKeyCache } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomWithQueryOptions, AtomWithQueryFn } from './types';
import { setWeakCacheItem } from '../cache';
import { queryKeyObserver } from './react-query/query-key-observer';
import { getQueryClientAtom, queryClientAtom } from './react-query/query-client-atom';
import { Atom } from 'jotai/ts3.4';

type QueryKeyOrGetQueryKey = QueryKey | ((get: Getter) => QueryKey);
type QueryOptionsOrGetQueryOptions<Data> =
  | ((get: Getter) => AtomWithQueryOptions<Data>)
  | AtomWithQueryOptions<Data>;

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

const getQueryKey = (get: Getter, key: QueryKeyOrGetQueryKey, queryKeyAtom?: Atom<QueryKey>) => {
  const queryKey = typeof key === 'function' ? key(get) : key;
  if (queryKeyAtom) return makeQueryKey(queryKey, get(queryKeyAtom));
  return makeQueryKey(queryKey);
};

export const atomWithQuery = <Data>(
  key: QueryKeyOrGetQueryKey,
  queryFn: AtomWithQueryFn<Data>,
  queryOptions: QueryOptionsOrGetQueryOptions<Data> = {}
) => {
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

    const queryKey = getQueryKey(get, key, queryKeyAtom);
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
        queryFn: context => queryFn(get, context),
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
          void observer?.refetch();
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
  return anAtom;
};
