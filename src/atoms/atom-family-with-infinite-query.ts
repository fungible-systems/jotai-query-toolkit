import { atomFamily, atomWithDefault } from 'jotai/utils';
import { makeAtomFamilyWithQuery } from './utils/make-atom-family-with-query';
import { atom, Getter } from 'jotai';
import { queryClientAtom } from 'jotai/query';
import { hashQueryKey, QueryClient, QueryKey } from 'react-query';
import {
  AtomFamilyWithInfiniteQuery,
  AtomFamilyWithQueryFn,
  InfiniteQueryDispatch,
  ParamWithListParams,
} from './types';
import deepEqual from 'fast-deep-equal';
import { Scope } from 'jotai/core/atom';
import { makeQueryKey } from '../utils';
import mergeDeep from 'merge-deep';

type Status = 'idle' | 'isFetching';
const atomFamilyWithInfiniteQueryStatus = atomFamily<string, Status, Status>(_queryKey =>
  atomWithDefault<Status>(() => 'idle')
);
export const atomFamilyWithInfiniteQuery = <Param, Data>(
  key: QueryKey,
  queryFn: AtomFamilyWithQueryFn<ParamWithListParams<Param>, Data>,
  options: AtomFamilyWithInfiniteQuery<Data>,
  scope?: Scope
) => {
  const { limit, getNextOffset, queryKeyAtom, ...rest } = options;
  return atomFamily<Param, [Data[], Status], InfiniteQueryDispatch>(param => {
    const queryParam = [param, { limit, offset: 0 }];
    let queryKey = makeQueryKey(key, queryParam);
    const hashedQueryKey = hashQueryKey(queryKey);
    const getQueryKey = (get: Getter) => {
      if (queryKeyAtom)
        queryKey = makeQueryKey(key, [param, { limit, offset: 0 }, get(queryKeyAtom)]);
    };

    const paginatedDataAtomFamily = atomFamily<string, Data[], Data[]>(_queryKey =>
      atomWithDefault<Data[]>(() => [])
    );

    const statusAtom = atomFamilyWithInfiniteQueryStatus(hashedQueryKey);
    const dataAtom = paginatedDataAtomFamily(hashedQueryKey);
    let onSuccess = undefined;
    const queryAtom = makeAtomFamilyWithQuery<[Param, { limit: number; offset: number }], Data>(
      key,
      queryFn,
      queryKeyAtom,
      scope
    )({
      // TODO: make it possible to revalidate Data[]
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      ...rest,
    });

    const anAtom = atom<[Data[], Status], InfiniteQueryDispatch>(
      get => {
        getQueryKey(get);
        const status = get(statusAtom);
        const data = get(dataAtom) as unknown as Data[];
        return [data, status];
      },
      async (
        get,
        set,
        action: { type: 'mount' } | { type: 'next' } | { type: 'prev' } | { type: 'refresh' }
      ) => {
        const queryClient = get(queryClientAtom) || new QueryClient();

        const currentData =
          (get(paginatedDataAtomFamily(hashedQueryKey)) as unknown as Data[]) || [];
        if (action.type === 'mount') {
          queryClient.setQueryDefaults(queryKey, {
            onSuccess: data => {
              console.log('hello');
              let [firstData, ...restData] = get(dataAtom);
              const isDiff = deepEqual(data, firstData);
              if (isDiff) {
                const merged = mergeDeep(data, firstData);
                set<Data[], Data[]>(dataAtom, [merged, ...restData]);
              }
            },
          });
          const data = await get(queryAtom(queryParam as any), true);

          set<Data[], Data[]>(dataAtom, [...currentData, data]);
          console.log(queryKey, hashedQueryKey);
          console.log(queryClient.getQueryCache());
        }
        if (action.type === 'next') {
          const offset = getNextOffset(currentData[currentData.length - 1], currentData);
          if (offset === false) return;
          set(statusAtom, 'isFetching');
          queryClient
            ?.fetchQuery(queryKey, () =>
              queryFn(
                get,
                // updated query params here
                [param, { limit, offset }]
              )
            )
            .then(data => {
              set<Data[], Data[]>(dataAtom, [...currentData, data]);
              set(statusAtom, 'idle');
            });
        }
      }
    );
    anAtom.onMount = setAtom => setAtom({ type: 'mount' });
    if (scope) anAtom.scope = scope;
    return anAtom;
  }, deepEqual);
};
