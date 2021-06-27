import { atomFamilyWithQuery } from './atom-family-with-query';
import { atomFamilyWithInfiniteQuery } from './atom-family-with-infinite-query';
import memoize from 'micro-memoize';
import {
  AtomFamilyWithInfiniteQuery,
  AtomFamilyWithQueryFn,
  AtomWithQueryRefreshOptions,
  InfiniteQueryOptions,
  ParamWithListParams,
} from './types';

export const makeAtomFamilyWithQuery = <Param, Data>(
  queryKey: string,
  queryFn: AtomFamilyWithQueryFn<Param, Data>
) => {
  return memoize((options: AtomWithQueryRefreshOptions<Data> = {}) => {
    return atomFamilyWithQuery<Param, Data>(queryKey, queryFn, {
      ...options,
    });
  });
};

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
