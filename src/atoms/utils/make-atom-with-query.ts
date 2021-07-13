import memoize from 'proxy-memoize';
import { atomWithQuery } from '../atom-with-query';
import type { AtomWithQueryOptions, AtomWithQueryFn } from '../types';
import type { QueryKey } from 'react-query';

export const makeAtomWithQuery = memoize(
  <Data>(initOptions: { queryKey: QueryKey; queryFn: AtomWithQueryFn<Data> }) =>
    memoize((options: AtomWithQueryOptions<Data> = {}) =>
      atomWithQuery<Data>(initOptions.queryKey, initOptions.queryFn, options)
    )
);
