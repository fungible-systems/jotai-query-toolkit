import memoize from 'micro-memoize';

import type { AtomWithQueryRefreshOptions, AtomWithQueryRefreshQueryFn } from '../types';
import { atomWithQueryRefresh } from '../atom-with-query-refresh';

export const makeAtomWithQueryRefresh = <Data>(
  queryKey: string,
  queryFn: AtomWithQueryRefreshQueryFn<Data>
) => {
  return memoize((options: AtomWithQueryRefreshOptions<Data> = {}) => {
    return atomWithQueryRefresh<Data>(queryKey, queryFn, {
      ...options,
    });
  });
};
