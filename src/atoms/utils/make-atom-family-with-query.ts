import memoize from 'micro-memoize';
import { atomFamilyWithQuery } from '../atom-family-with-query';
import type { AtomFamilyWithQueryFn, AtomWithQueryRefreshOptions } from '../types';

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
