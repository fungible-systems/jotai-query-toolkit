import { createElement, useMemo } from 'react';
import { Provider } from 'jotai';
import { hashQueryKey } from 'react-query';
import { useQueryInitialValues } from './use-query-initial-values';
import { buildInitialValueAtoms } from './build-initial-value-atoms';

import type { NextPage } from 'next';
import type { InitialValuesAtomBuilder } from './types';
import { Atom } from 'jotai/core/atom';

/**
 * withInitialQueryData
 *
 * This is a higher-order-component (HoC) that wraps a next.js page with queries that
 * are then fetched on the server and injected into a Jotai Provider.
 *
 * @typeParam QueryProps - optional, these types are for the generic global query props that each query has access to
 * @typeParam PageProps - the next.js page props
 * @param WrappedComponent - The next.js page component to wrap
 * @param initialValuesAtomBuilders - Optional values to add to our provider
 */
export function withInitialQueryData<QueryProps = unknown, PageProps = Record<string, unknown>>(
  WrappedComponent: NextPage<PageProps>,
  initialValuesAtomBuilders?: InitialValuesAtomBuilder[]
) {
  const Wrapper: NextPage<{
    initialQueryData?: Record<string, unknown>;
  }> = ({ initialQueryData, ...props }) => {
    let initialValues: [Atom<unknown>, unknown][] = [];

    if (initialQueryData) {
      if ('error' in initialQueryData)
        // the error object { error: boolean; message: string }
        return createElement(WrappedComponent, { ...initialQueryData, ...props } as PageProps);

      const initialQueries = useQueryInitialValues(initialQueryData);
      initialValues = Array.from(initialQueries);
    }

    // sometimes apps require additional atoms to be set within this provider,
    // this will build the atoms and add them to our initialValues array
    if (initialValuesAtomBuilders) {
      initialValues = initialValues.concat(
        buildInitialValueAtoms(props as Record<string, unknown>, initialValuesAtomBuilders)
      );
      initialValuesAtomBuilders.forEach(([propKey]) => {
        delete (props as Record<string, unknown>)[propKey];
      });
    }

    const keys = initialQueryData ? Object.keys(initialQueryData) : [];
    // this key is very important, without passing key={key} to the Provider,
    // it won't know to re-render if someone navigates within the same page component in next.js
    const key = useMemo(() => hashQueryKey(keys), [keys]);

    return createElement(
      Provider,
      { initialValues, key },
      createElement(WrappedComponent, props as PageProps)
    );
  };

  return Wrapper as unknown as NextPage<PageProps>;
}
