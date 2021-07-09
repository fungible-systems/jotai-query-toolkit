import { Atom, Getter } from 'jotai';
import { hashQueryKey, QueryKey } from 'react-query';
import { makeQueryKey } from 'jotai-query-toolkit';

export const getQueryKey = <Param>(
  get: Getter,
  key: QueryKey,
  param?: Param,
  queryKeyAtom?: Atom<QueryKey>
) => {
  if (queryKeyAtom) return makeQueryKey(key, [param, get(queryKeyAtom)]);
  return makeQueryKey(key, param);
};

export function getKeys<Param>(
  get: Getter,
  key: QueryKey,
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
