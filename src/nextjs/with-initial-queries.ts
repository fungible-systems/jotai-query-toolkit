import { createElement, useMemo } from 'react';
import { queryClient } from 'jotai-query-toolkit';
import { Provider } from 'jotai';
import { hashQueryKey } from 'react-query';
import { getInitialPropsFromQueries } from './get-initial-props-from-queries';
import { useQueryInitialValues } from './use-query-initial-values';
import { buildInitialValueAtoms } from './build-initial-value-atoms';

import type { NextPage, NextPageContext } from 'next';
import type { InitialValuesAtomBuilder, GetQueries, Queries, QueryPropsGetter } from './types';

/**
 * withInitialQueries
 *
 * This is a higher-order-component (HoC) that wraps a next.js page with queries that
 * are then fetched on the server and injected into a Jotai Provider.
 *
 * @typeParam QueryProps - optional, these types are for the generic global query props that each query has access to
 * @typeParam PageProps - the next.js page props
 * @param WrappedComponent - The next.js page component to wrap
 * @param initialValuesAtomBuilders - Optional values to add to our provider
 */
export function withInitialQueries<QueryProps = unknown, PageProps = Record<string, unknown>>(
  WrappedComponent: NextPage<PageProps>,
  initialValuesAtomBuilders?: InitialValuesAtomBuilder[]
) {
  /**
   * withWrapper
   *
   * the function that creates our wrapper component and fetches our queries in addition to the next.js page getInitialProps
   *
   * @param getQueries - the set of queries or getter function for getting the queries
   * @param getQueryProps - optional getter for additional context props that will be fed to getQueries
   */
  function withWrapper(
    getQueries: Queries<QueryProps> | GetQueries<QueryProps>,
    getQueryProps?: QueryPropsGetter<QueryProps>
  ): NextPage<PageProps> {
    function Wrapper({
      initialQueryData,
      ...props
    }: {
      initialQueryData: Record<string, unknown>;
    }) {
      if ('error' in initialQueryData)
        // the error object { error: boolean; message: string }
        return createElement(WrappedComponent, { ...initialQueryData, ...props } as PageProps);

      const initialQueries = useQueryInitialValues(initialQueryData);

      let initialValues = Array.from(initialQueries);

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

      const keys = Object.keys(initialQueryData);
      // this key is very important, without passing key={key} to the Provider,
      // it won't know to re-render if someone navigates within the same page component in next.js
      const key = useMemo(() => hashQueryKey(keys), [keys]);

      return createElement(
        Provider,
        { initialValues, key },
        createElement(WrappedComponent, props as PageProps)
      );
    }

    // This is how we can inject the query data into each page
    // this is actually the new page for the wrapped page
    Wrapper.getInitialProps = async (ctx: NextPageContext) => {
      const promises: Promise<any>[] = [
        getInitialPropsFromQueries<QueryProps>({
          getQueries,
          getQueryProps,
          ctx,
          queryClient,
        }),
      ];

      // if the wrapped page has a getInitialProps function
      // we need to make sure to also fetch that data
      if (WrappedComponent.getInitialProps) {
        const asyncGetInitialProps = async () =>
          (await WrappedComponent?.getInitialProps?.(ctx)) || {};
        promises.push(asyncGetInitialProps());
      }

      const [initialQueryData, componentProps] = await Promise.all(promises);

      return {
        initialQueryData,
        ...componentProps,
      };
    };

    return Wrapper as unknown as NextPage<PageProps>;
  }

  return withWrapper;
}
