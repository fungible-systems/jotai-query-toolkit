import memoize from 'proxy-memoize';
import { atomFamilyWithQuery } from '../atom-family-with-query';

import type { QueryKey } from 'react-query';
import type { AtomFamilyWithQueryFn, AtomWithQueryOptions } from '../types';
import type { AtomFamily } from '../types';
import type { WritableAtom } from 'jotai';
import type { JQTAtomWithQueryActions } from '../atom-with-query';

interface MakeAtomFamilyWithQueryInitOptions<Param, Data> {
  queryKey: QueryKey;
  queryFn: AtomFamilyWithQueryFn<Param, Data>;
}

type MakeAtomFamilyWithQueryReturn<Param, Data> = AtomFamily<
  Param,
  WritableAtom<Data, JQTAtomWithQueryActions<Data>>
>;

export const makeAtomFamilyWithQuery = memoize(
  <Param, Data>(initOptions: MakeAtomFamilyWithQueryInitOptions<Param, Data>) => {
    const fn = memoize(
      (options: AtomWithQueryOptions<Data> = {}): MakeAtomFamilyWithQueryReturn<Param, Data> => {
        const { queryFn, queryKey, ...defaultOptions } = initOptions;
        const anAtom = atomFamilyWithQuery<Param, Data>(queryKey, queryFn, {
          ...defaultOptions,
          ...options,
        });
        return anAtom;
      }
    );
    return fn;
  }
);
