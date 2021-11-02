import { InitialValuesAtomBuilder } from './types';
import { Atom } from 'jotai/core/atom';

export function buildInitialValueAtoms(
  props: Record<string, unknown>,
  atomBuilders: InitialValuesAtomBuilder[]
): Iterable<readonly [Atom<unknown>, unknown]> {
  return atomBuilders.map(([propKey, builder]) => {
    const propData = props[propKey];
    return builder(propData);
  });
}
