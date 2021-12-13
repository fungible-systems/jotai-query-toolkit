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
  // check so we don't include it more than once
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const hashedParams = param ? hashQueryKey(param as any).slice(1, -1) : undefined;
  const hashedKey = hashQueryKey(key);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const hashedContainsParams = hashedKey?.includes(hashedParams as any);

  // todo: should probably deprecate this
  if (queryKeyAtom) {
    const qkAtomValue = get(queryKeyAtom);
    return makeQueryKey(key, hashedContainsParams ? qkAtomValue : [param, qkAtomValue]);
  }

  // do not include params more than 1 time
  if (hashedContainsParams) return makeQueryKey(key);

  // params not included, so we should include them
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
