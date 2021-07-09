import memoize from 'micro-memoize';

import { atomWithQuery } from '../atom-with-query';
import type { AtomWithQueryRefreshOptions, AtomWithQueryFn } from '../types';
import type { QueryKey } from 'react-query';

const fn = <Data>(queryKey: QueryKey, queryFn: AtomWithQueryFn<Data>) =>
  memoize((options: AtomWithQueryRefreshOptions<Data> = {}) =>
    atomWithQuery<Data>(queryKey, queryFn, options)
  );

export const makeAtomWithQuery = memoize(fn);
