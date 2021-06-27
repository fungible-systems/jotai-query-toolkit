import { atomFamily, atomWithDefault } from 'jotai/utils';
import { makeAtomFamilyWithQuery } from './utils/make-atom-family-with-query';
import { atom } from 'jotai';
import { queryClientAtom } from 'jotai/query';
import { hashQueryKey, QueryClient } from 'react-query';
import {
  AtomFamilyWithInfiniteQuery,
  AtomFamilyWithQueryFn,
  InfiniteQueryDispatch,
  ParamWithListParams,
} from './types';
import deepEqual from 'fast-deep-equal';

type Status = 'idle' | 'isFetching';
const atomFamilyWithInfiniteQueryStatus = atomFamily<string, Status, Status>(_queryKey =>
  atomWithDefault<Status>(() => 'idle')
);
export const atomFamilyWithInfiniteQuery = <Param, Data>(
  queryKey: string,
  queryFn: AtomFamilyWithQueryFn<ParamWithListParams<Param>, Data>,
  options: AtomFamilyWithInfiniteQuery<Data>
) => {
  const { limit, getNextOffset, ...rest } = options;
  return atomFamily<Param, [Data[], Status], InfiniteQueryDispatch>(param => {
    const paginatedDataAtomFamily = atomFamily<Param, Data[], Data[]>(_queryKey =>
      atomWithDefault<Data[]>(() => [])
    );
    const queryAtom = makeAtomFamilyWithQuery<ParamWithListParams<Param>, Data>(
      queryKey,
      queryFn
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
        const status = get(atomFamilyWithInfiniteQueryStatus(hashQueryKey([queryKey, param])));
        const data = get(paginatedDataAtomFamily(param)) as unknown as Data[];
        return [data, status];
      },
      async (
        get,
        set,
        action: { type: 'mount' } | { type: 'next' } | { type: 'prev' } | { type: 'refresh' }
      ) => {
        const currentData = (get(paginatedDataAtomFamily(param)) as unknown as Data[]) || [];
        if (action.type === 'mount') {
          const data = await get(queryAtom([param, { limit, offset: 0 }]), true);
          set<Data, Data[]>(paginatedDataAtomFamily(param) as any, [...currentData, data]);
        }
        if (action.type === 'next') {
          const offset = getNextOffset(currentData[0], currentData);
          if (offset === false) return;
          const queryClient = get(queryClientAtom) || new QueryClient();
          set(atomFamilyWithInfiniteQueryStatus(hashQueryKey([queryKey, param])), 'isFetching');
          queryClient
            ?.fetchQuery([queryKey, param], () => queryFn(get, [param, { limit, offset }]))
            .then(data => {
              set<Data[], Data[]>(paginatedDataAtomFamily(param), [...currentData, data]);
              set(atomFamilyWithInfiniteQueryStatus(hashQueryKey([queryKey, param])), 'idle');
            });
        }
      }
    );
    anAtom.onMount = setAtom => setAtom({ type: 'mount' });
    return anAtom;
  }, deepEqual);
};
