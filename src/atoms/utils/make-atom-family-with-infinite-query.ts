import memoize from 'micro-memoize';
import { atomFamilyWithInfiniteQuery } from '../atom-family-with-infinite-query';
import type {
  AtomFamilyWithInfiniteQuery,
  AtomFamilyWithQueryFn,
  AtomWithQueryRefreshOptions,
  InfiniteQueryOptions,
  ParamWithListParams,
} from '../types';
import type { Scope } from 'jotai/core/atom';
import type { QueryKey } from 'react-query';

const fn = <Param, Data>(
  queryKey: QueryKey,
  queryFn: AtomFamilyWithQueryFn<ParamWithListParams<Param>, Data>,
  infiniteQueryOptions: InfiniteQueryOptions<Data>,
  scope?: Scope
) =>
  memoize(
    (
      options: AtomWithQueryRefreshOptions<Data> & Partial<AtomFamilyWithInfiniteQuery<Data>> = {}
    ) =>
      atomFamilyWithInfiniteQuery<Param, Data>(
        queryKey,
        queryFn,
        {
          ...options,
          ...infiniteQueryOptions,
        },
        scope
      )
  );

export const makeAtomFamilyWithInfiniteQuery = memoize(fn);
