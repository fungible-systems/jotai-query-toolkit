import memoize from 'proxy-memoize';
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

type InitOptions<Param, Data> = MakeAtomFamilyWithInfiniteQueryOptions<Param, Data>;
type Options<Data> = Omit<AtomWithInfiniteQueryOptions<Data>, 'queryKey' | 'queryFn'>;
type Return<Param, Data> = AtomFamily<
  Param,
  WritableAtom<InfiniteData<Data> | undefined, AtomWithInfiniteQueryAction<Data>>
>;

export const makeAtomFamilyWithInfiniteQuery = memoize(
  <Param, Data>(initOptions: InitOptions<Param, Data>) =>
    memoize((options: Options<Data> = {}): Return<Param, Data> => {
      const { queryFn, queryKey, ...defaultOptions } = initOptions;
      const anAtom = atomFamilyWithInfiniteQuery<Param, Data>(queryKey, queryFn, {
        ...defaultOptions,
        ...options,
      });
      return anAtom;
    })
);
