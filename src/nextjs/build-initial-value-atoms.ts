import { makeError } from '../utils';
import { InitialValuesAtomBuilder } from './types';

export function buildInitialValueAtoms(
  props: Record<string, unknown>,
  atomBuilders: InitialValuesAtomBuilder[]
) {
  return atomBuilders.map(([propKey, builder]) => {
    const propData = props[propKey];
    if (!propData) throw makeError(`No value found for ${propKey}`);
    return builder(propData);
  });
}
