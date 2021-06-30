import memoize from 'micro-memoize';

import type { AtomWithQueryRefreshOptions, AtomWithQueryRefreshQueryFn } from '../types';
import { atomWithQueryRefresh } from '../atom-with-query-refresh';
import { Scope } from 'jotai/core/atom';
import { QueryKey } from 'react-query';

const fn = <Data>(
  queryKey: QueryKey,
  queryFn: AtomWithQueryRefreshQueryFn<Data>,
  queryKeyAtom?: AtomWithQueryRefreshOptions<Data>['queryKeyAtom'],
  scope?: Scope
) =>
  memoize((options: AtomWithQueryRefreshOptions<Data> = {}) =>
    atomWithQueryRefresh<Data>(
      queryKey,
      queryFn,
      {
        ...options,
      },
      scope
    )
  );

export const makeAtomWithQueryRefresh = memoize(fn);
