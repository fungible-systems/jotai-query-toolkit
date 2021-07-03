import memoize from 'micro-memoize';
import { atomFamilyWithQuery } from '../atom-family-with-query';
import type { QueryKey } from 'react-query';
import type { Scope } from 'jotai/core/atom';
import type { AtomFamilyWithQueryFn, AtomWithQueryRefreshOptions } from '../types';

const fn = <Param, Data>(
  queryKey: QueryKey,
  queryFn: AtomFamilyWithQueryFn<Param, Data>,
  queryKeyAtom?: AtomWithQueryRefreshOptions<Data>['queryKeyAtom'],
  scope?: Scope
) =>
  memoize((options: AtomWithQueryRefreshOptions<Data> = {}) =>
    atomFamilyWithQuery<Param, Data>(
      queryKey,
      queryFn,
      {
        queryKeyAtom,
        ...options,
      },
      scope
    )
  );

export const makeAtomFamilyWithQuery = memoize(fn);
