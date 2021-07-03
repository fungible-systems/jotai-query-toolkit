import memoize from 'micro-memoize';

import type { AtomWithQueryRefreshOptions, AtomWithQueryRefreshQueryFn } from '../types';
import { atomWithQuery } from '../atom-with-query-refresh';
import { Scope } from 'jotai/core/atom';
import { QueryKey } from 'react-query';

const fn = <Data>(
  queryKey: QueryKey,
  queryFn: AtomWithQueryRefreshQueryFn<Data>,
  queryKeyAtom?: AtomWithQueryRefreshOptions<Data>['queryKeyAtom'],
  scope?: Scope
) =>
  memoize((options: AtomWithQueryRefreshOptions<Data> = {}) =>
    atomWithQuery<Data>(
      queryKey,
      queryFn,
      {
        ...options,
      },
      scope
    )
  );

export const makeAtomWithQueryRefresh = memoize(fn);
