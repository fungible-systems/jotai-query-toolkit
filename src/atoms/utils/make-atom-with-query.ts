import memoize from 'micro-memoize';

import type { AtomWithQueryRefreshOptions, AtomWithQueryFn } from '../types';
import { atomWithQuery } from '../atom-with-query-refresh';
import { Scope } from 'jotai/core/atom';
import { QueryKey } from 'react-query';

const fn = <Data>(queryKey: QueryKey, queryFn: AtomWithQueryFn<Data>, scope?: Scope) =>
  memoize((options: AtomWithQueryRefreshOptions<Data> = {}) =>
    atomWithQuery<Data>(queryKey, queryFn, options, scope)
  );

export const makeAtomWithQuery = memoize(fn);
