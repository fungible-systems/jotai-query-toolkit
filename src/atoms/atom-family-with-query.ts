import deepEqual from 'fast-deep-equal';
import { atom, Getter } from 'jotai';
import { atomWithQuery, queryClientAtom } from 'jotai/query';
import { atomFamily } from 'jotai/utils';
import { hashQueryKey, QueryKey } from 'react-query';
import { makeQueryKey } from '../utils';
import { initialDataAtom } from './intitial-data-atom';
import { IS_SSR, QueryRefreshRates } from '../constants';
import { AtomFamilyWithQueryFn, AtomWithQueryRefreshOptions } from './types';
import { Scope } from 'jotai/core/atom';

export const atomFamilyWithQuery = <Param, Data>(
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

  let shouldRefresh = true;

  return atomFamily<Param, Data>(param => {
    let queryKey = makeQueryKey(key, param);

    const getQueryKey = (get: Getter) => {
      if (queryKeyAtom) queryKey = makeQueryKey(key, [param, get(queryKeyAtom)]);
    };

    const queryAtom = atomWithQuery(get => {
      const queryClient = get(queryClientAtom);
      const defaultOptions = queryClient?.getDefaultOptions() || {};
      getQueryKey(get);
      const initialData = (get(initialDataAtom(queryKey)) as unknown as Data) || undefined;
      if (getShouldRefetch && initialData) shouldRefresh = getShouldRefetch(initialData);
      return {
        queryKey,
        queryFn: () => queryFn(get, param),
        ...defaultOptions,
        initialData,
        refetchInterval: shouldRefresh
          ? refetchInterval === false
            ? false
            : refetchInterval || QueryRefreshRates.Default
          : false,
        ...rest,
      };
    }, equalityFn);
    queryAtom.debugLabel = `atomFamilyWithQuery/queryAtom/${hashQueryKey(queryKey as QueryKey)}`;

    const anAtom = atom(
      get => {
        getQueryKey(get);
        const initialData = get(initialDataAtom(queryKey));
        if (IS_SSR) {
          return initialData as unknown as Data;
        } else {
          const queryData = get(queryAtom);
          return (queryData || initialData) as Data;
        }
      },
      async get => {
        const queryClient = get(queryClientAtom);
        await queryClient?.refetchQueries({
          queryKey,
        });
      }
    );
    anAtom.debugLabel = `atomFamilyWithQuery/${hashQueryKey(queryKey as QueryKey)}`;

    if (scope) {
      queryAtom.scope = scope;
      anAtom.scope = scope;
    }

    return anAtom;
  }, deepEqual);
};
