import memoize from 'micro-memoize';
import { atomFamilyWithInfiniteQuery } from '../atom-family-with-infinite-query';
import type {
  AtomFamilyWithInfiniteQuery,
  AtomFamilyWithQueryFn,
  AtomWithQueryRefreshOptions,
  InfiniteQueryOptions,
  ParamWithListParams,
} from '../types';

export const makeAtomFamilyWithInfiniteQuery = <Param, Data>(
  queryKey: string,
  queryFn: AtomFamilyWithQueryFn<ParamWithListParams<Param>, Data>,
  infiniteQueryOptions: InfiniteQueryOptions<Data>
) => {
  return memoize(
    (
      options: AtomWithQueryRefreshOptions<Data> & Partial<AtomFamilyWithInfiniteQuery<Data>> = {}
    ) => {
      return atomFamilyWithInfiniteQuery<Param, Data>(queryKey, queryFn, {
        ...infiniteQueryOptions,
        ...options,
      });
    }
  );
};
