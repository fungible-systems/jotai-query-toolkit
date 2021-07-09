import { InitialValuesAtomBuilder } from './types';

export function buildInitialValueAtoms(
  props: Record<string, unknown>,
  atomBuilders: InitialValuesAtomBuilder[]
) {
  return atomBuilders.map(([propKey, builder]) => {
    const propData = props[propKey];
    return builder(propData);
  });
}
