import { Atom, Getter } from 'jotai';
import { hashQueryKey, QueryKey } from 'react-query';

import { QueryKeyOrGetQueryKey } from '../types';
import { makeQueryKey } from '../../utils';

export const getQueryKey = <Param>(
  get: Getter,
  getKey: QueryKeyOrGetQueryKey<Param>,
  param?: Param,
  queryKeyAtom?: Atom<QueryKey>
) => {
  const key = typeof getKey === 'function' ? getKey(get, param as Param) : getKey;
  if (queryKeyAtom) return makeQueryKey(key, [param, get(queryKeyAtom)]);
  return makeQueryKey(key, param);
};

export function getKeys<Param>(
  get: Getter,
  key: QueryKeyOrGetQueryKey<Param>,
  param?: Param,
  queryKeyAtom?: Atom<QueryKey>
) {
  const queryKey = getQueryKey<Param>(get, key, param, queryKeyAtom);
  const hashedQueryKey = hashQueryKey(queryKey);
  return { queryKey, hashedQueryKey };
}

export function makeHashedQueryKey<Param>(key: QueryKey, param?: Param) {
  return hashQueryKey(makeQueryKey<Param>(key, param));
}

export function makeDebugLabel<Param>(atomLabel: string, key: QueryKey, param?: Param) {
  return `${atomLabel}/${makeHashedQueryKey<Param>(key, param)}`;
}
