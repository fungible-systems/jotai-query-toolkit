import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { hashQueryKey, QueryKey } from 'react-query';
import deepEqual from 'fast-deep-equal';

export const initialDataAtom = atomFamily(queryKey => {
  const anAtom = atom(undefined);
  anAtom.debugLabel = `initialDataAtom/${hashQueryKey(queryKey as QueryKey)}`;
  return anAtom;
}, deepEqual);
