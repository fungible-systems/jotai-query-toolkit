import memoize, { MicroMemoize } from 'micro-memoize';
import { atomFamilyWithInfiniteQuery } from '../atom-family-with-infinite-query';
import type {
  AtomWithInfiniteQueryOptions,
  AtomFamilyWithInfiniteQueryFn,
  AtomFamily,
} from '../types';
import type { Scope } from 'jotai/core/atom';
import type { InfiniteData, QueryKey } from 'react-query';
import { AtomWithInfiniteQueryAction } from 'jotai/query';
import { WritableAtom } from 'jotai';

export const makeAtomFamilyWithInfiniteQuery = <Param, Data>(
  queryKey: QueryKey,
  queryFn: AtomFamilyWithInfiniteQueryFn<Param, Data>,
  defaultOptions: AtomWithInfiniteQueryOptions<Data> = {},
  scope?: Scope
) =>
  memoize(
    (
      options: AtomWithInfiniteQueryOptions<Data> = {}
    ): AtomFamily<Param, WritableAtom<InfiniteData<Data>, AtomWithInfiniteQueryAction>> =>
      atomFamilyWithInfiniteQuery<Param, Data>(
        queryKey,
        queryFn,
        {
          ...defaultOptions,
          ...options,
        },
        scope
      )
  );
