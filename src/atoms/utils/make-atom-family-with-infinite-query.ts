import { atomFamilyWithInfiniteQuery } from '../atom-family-with-infinite-query';
import type {
  AtomWithInfiniteQueryOptions,
  AtomFamilyWithInfiniteQueryFn,
  AtomFamily,
} from '../types';
import type { InfiniteData, QueryKey } from 'react-query';
import type { AtomWithInfiniteQueryAction } from 'jotai/query';
import type { WritableAtom } from 'jotai';

interface MakeAtomFamilyWithInfiniteQueryOptions<Param, Data>
  extends Omit<AtomWithInfiniteQueryOptions<Data>, 'queryFn'> {
  queryKey: QueryKey;
  queryFn: AtomFamilyWithInfiniteQueryFn<Param, Data>;
}

const cache = new WeakMap();
type InitOptions<Param, Data> = MakeAtomFamilyWithInfiniteQueryOptions<Param, Data>;
type Options<Data> = Omit<AtomWithInfiniteQueryOptions<Data>, 'queryKey' | 'queryFn'>;
type Return<Param, Data> = AtomFamily<
  Param,
  WritableAtom<InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction>
>;

export const makeAtomFamilyWithInfiniteQuery =
  <Param, Data>(initOptions: InitOptions<Param, Data>) =>
  (options: Options<Data> = {}): Return<Param, Data> => {
    const deps = [initOptions, options] as const;
    if (cache.has(deps)) {
      return cache.get(deps);
    }
    const { queryFn, queryKey, ...defaultOptions } = initOptions;
    const anAtom = atomFamilyWithInfiniteQuery<Param, Data>(queryKey, queryFn, {
      ...defaultOptions,
      ...options,
    });
    cache.set(deps, anAtom);
    return anAtom;
  };
