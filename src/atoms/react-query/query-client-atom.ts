import { queryClient } from '../../query-client';
import { atom, Getter } from 'jotai';

export const queryClientAtom = atom(queryClient);
export const getQueryClientAtom = (get: Getter) => get(queryClientAtom);
