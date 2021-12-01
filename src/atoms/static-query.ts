import { hashQueryKey, QueryKey } from 'react-query';
import { atom, Atom, Getter } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { initialDataAtom } from 'jotai-query-toolkit';
import { Queries } from '../nextjs/types';

export function makeInitialDataAtom(queryKey: QueryKey) {
  return initialDataAtom(hashQueryKey(queryKey));
}

function getInitialData<ReturnType>(get: Getter, queryKey: QueryKey) {
  const result = get(makeInitialDataAtom(queryKey));
  if (result) return result as ReturnType;
}

export function atomFamilyWithStaticQuery<ParamType, ReturnType>(
  getQueryKey: QueryKey | ((param: ParamType) => QueryKey),
  queryFn: (param: ParamType, get?: Getter) => ReturnType | Promise<ReturnType>
) {
  return atomFamily<ParamType, Atom<ReturnType | Promise<ReturnType>>>(param =>
    atom<ReturnType | Promise<ReturnType>>(get => {
      const queryKey = typeof getQueryKey === 'function' ? getQueryKey(param) : getQueryKey;
      return getInitialData<ReturnType>(get, queryKey) ?? queryFn(param, get);
    })
  );
}

export function queryFamilyFactory<ParamType, ReturnType>(
  getQueryKey: QueryKey | ((param: ParamType) => QueryKey),
  queryFn: (param: ParamType) => ReturnType | Promise<ReturnType>
) {
  return function queryFamilyBuilder(param: ParamType): Queries[number] {
    const queryKey = typeof getQueryKey === 'function' ? getQueryKey(param) : getQueryKey;
    return [queryKey, () => queryFn(param)] as const;
  };
}
