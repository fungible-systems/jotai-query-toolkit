import { createElement } from 'react';
import { Provider } from 'jotai';
import { useGetProviderInitialValues } from './use-get-initial-query-props';

import type { NextPage } from 'next';
import type { InitialValuesAtomBuilder } from './types';

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
  }> = props => {
    const { initialValues, key, ...childProps } = useGetProviderInitialValues(
      props,
      initialValuesAtomBuilders
    );
    return createElement(
      Provider,
      { initialValues, key },
      createElement(WrappedComponent, childProps as PageProps)
    );
  };

  return Wrapper as unknown as NextPage<PageProps>;
}
