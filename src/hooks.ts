import { atom, PrimitiveAtom } from 'jotai';
import { queryKeyMap } from './utils';
import { useAtomValue } from 'jotai/utils';
import { InfiniteQueryStatus, infiniteQueryKeyStatusAtom } from './atoms/query-key-status-atom';

const noopAtom = atom<undefined>(undefined);

export function useAtomWithInfiniteQueryStatus(
  queryAtom: PrimitiveAtom<any>
): undefined | InfiniteQueryStatus {
  const queryKey = queryKeyMap.get(queryAtom);
  return useAtomValue<undefined | InfiniteQueryStatus>(
    queryKey ? infiniteQueryKeyStatusAtom(queryKey) : noopAtom
  );
}
