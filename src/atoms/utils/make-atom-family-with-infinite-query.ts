import memoize from 'micro-memoize';
import { atomFamilyWithInfiniteQuery } from '../atom-family-with-infinite-query';
import type {
  AtomWithInfiniteQueryOptions,
  AtomFamilyWithInfiniteQueryFn,
  AtomFamily,
} from '../types';
import type { Scope } from 'jotai/core/atom';
import type { InfiniteData, QueryKey } from 'react-query';
import { AtomWithInfiniteQueryAction } from 'jotai/query';
import { WritableAtom } from 'jotai';
import { getWeakCacheItem, setWeakCacheItem } from './weak-cache';

const atomFamilyWithInfiniteQueryCache = new WeakMap();

interface MakeAtomFamilyWithInfiniteQueryOptions<Param, Data>
  extends Omit<AtomWithInfiniteQueryOptions<Data>, 'queryFn'> {
  queryKey: QueryKey;
  queryFn: AtomFamilyWithInfiniteQueryFn<Param, Data>;
  scope?: Scope;
}

export const makeAtomFamilyWithInfiniteQuery = <Param, Data>(
  initOptions: MakeAtomFamilyWithInfiniteQueryOptions<Param, Data>
) => {
  return (
    options: AtomWithInfiniteQueryOptions<Data> = {}
  ): AtomFamily<Param, WritableAtom<InfiniteData<Data>, AtomWithInfiniteQueryAction>> => {
    const { queryFn, queryKey, scope, ...defaultOptions } = initOptions;
    return atomFamilyWithInfiniteQuery<Param, Data>(
      queryKey,
      queryFn,
      {
        ...defaultOptions,
        ...options,
      },
      scope
    );
  };
};
