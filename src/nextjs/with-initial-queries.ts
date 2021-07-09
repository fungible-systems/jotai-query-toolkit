import { createElement, useMemo } from 'react';
import { queryClient } from 'jotai-query-toolkit';
import { queryClientAtom } from 'jotai/query';
import { Provider } from 'jotai';
import { hashQueryKey } from 'react-query';
import { getInitialPropsFromQueries } from './get-initial-props-from-queries';
import { useQueryInitialValues } from './use-query-initial-values';

import type { NextPage, NextPageContext } from 'next';
import type { GetQueries, Queries, QueryPropsGetter } from './types';

/**
 * withInitialQueries
 *
 * Higher order function that wraps a next.js page component
 *
 * @param WrappedComponent - The next.js page component to wrap
 */
export function withInitialQueries<QueryProps = unknown, PageProps = Record<string, unknown>>(
  WrappedComponent: NextPage<PageProps>
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
    getQueries?: Queries<QueryProps> | GetQueries<QueryProps>,
    getQueryProps?: QueryPropsGetter<QueryProps>
  ): NextPage<PageProps> {
    const Wrapper: NextPage<{
      initialQueryData: Record<string, unknown>;
    }> = ({ initialQueryData, ...props }) => {
      const initialQueries = useQueryInitialValues(initialQueryData);
      const keys = Object.keys(initialQueryData);

      // this key is very important, without passing key={key} to the Provider,
      // it won't know to re-render if someone navigates within the same page component in next.js
      const key = useMemo(() => hashQueryKey(keys), [keys]);

      const initialValues = [
        [queryClientAtom, queryClient] as const,
        ...Array.from(initialQueries),
      ];
      return createElement(
        Provider,
        { initialValues, key },
        createElement(WrappedComponent, props as PageProps)
      );
    };

    Wrapper.getInitialProps = async (ctx: NextPageContext) => {
      const promises: Promise<any>[] = [];

      if (getQueries)
        promises.push(
          getInitialPropsFromQueries<QueryProps>({
            getQueries,
            getQueryProps,
            ctx,
            queryClient,
          })
        );

      if (WrappedComponent.getInitialProps) {
        const asyncGetInitialProps = async () =>
          (await WrappedComponent?.getInitialProps?.(ctx)) || {};
        promises.push(asyncGetInitialProps());
      }

      const [initialQueryData, componentProps] = await Promise.all(promises);

      return {
        key: hashQueryKey(Object.keys(initialQueryData)),
        initialQueryData,
        ...componentProps,
      };
    };

    return Wrapper as unknown as NextPage<PageProps>;
  }

  return withWrapper;
}
