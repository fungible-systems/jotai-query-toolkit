import { useAtomCallback, useHydrateAtoms } from 'jotai/utils';
import { useCallback, useEffect } from 'react';
import type { WritableAtom } from 'jotai';

export const useHydrateAndSyncAtoms = (
  values: Iterable<readonly [WritableAtom<unknown, unknown>, unknown]>
) => {
  useHydrateAtoms(values);
  const sync = useAtomCallback(
    useCallback(
      (_get, set) => {
        for (const [a, v] of values) {
          set(a, v);
        }
      },
      [values]
    )
  );
  useEffect(() => {
    void sync();
  }, [sync]);
};
