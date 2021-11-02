import { Atom } from 'jotai/core/atom';
import { useQueryInitialValues } from './use-query-initial-values';
import { buildInitialValueAtoms } from './build-initial-value-atoms';
import { hashQueryKey } from 'react-query';
import { InitialValuesAtomBuilder } from './types';
import { useMemo } from 'react';

function useBuildInitialValues(
  props: Record<string, unknown>,
  initialValuesAtomBuilders?: InitialValuesAtomBuilder[]
): [newProps: Record<string, unknown>, values: Iterable<readonly [Atom<unknown>, unknown]>] {
  if (!initialValuesAtomBuilders) return [props, []];
  const initialValues = buildInitialValueAtoms(
    props as Record<string, unknown>,
    initialValuesAtomBuilders
  );
  initialValuesAtomBuilders.forEach(([propKey]) => {
    delete (props as Record<string, unknown>)[propKey];
  });
  return [props, initialValues];
}

export const useGetProviderInitialValues = (
  {
    initialQueryData,
    ...props
  }: {
    [key: string]: unknown;
    initialQueryData?: Record<string, unknown>;
  },
  initialValuesAtomBuilders?: InitialValuesAtomBuilder[]
) => {
  const initialQueryValues: Iterable<readonly [Atom<unknown>, unknown]> =
    useQueryInitialValues(initialQueryData);

  // this key is very important, without passing key={key} to the Provider,
  // it won't know to re-render if someone navigates within the same page component in next.js
  const key = useMemo(
    () => hashQueryKey(initialQueryData ? Object.keys(initialQueryData) : []),
    [initialQueryData]
  );

  // sometimes apps require additional atoms to be set within this provider,
  // this will build the atoms and add them to our initialValues array
  const [updatedProps, initialAtomValues] = useBuildInitialValues(props, initialValuesAtomBuilders);

  const initialValues = useMemo(
    () => [...initialAtomValues, ...initialQueryValues],
    [initialQueryValues, initialAtomValues]
  );

  return {
    initialValues,
    key,
    ...updatedProps,
  };
};
