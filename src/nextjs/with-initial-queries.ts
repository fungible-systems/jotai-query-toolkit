import { withInitialQueryData } from './intial-queries-wrapper';

import type { NextPage } from 'next';
import type { InitialValuesAtomBuilder, GetQueries, Queries, QueryPropsGetter } from './types';
import { GetInitialProps, getInitialQueryProps } from './get-initial-query-props';

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
 * @param getInitialProps - Optional getInitialProps to be passed down to the wrapper
 */
export function withInitialQueries<QueryProps = unknown, PageProps = Record<string, unknown>>(
  WrappedComponent: NextPage<PageProps>,
  initialValuesAtomBuilders?: InitialValuesAtomBuilder[],
  getInitialProps?: GetInitialProps<PageProps>
) {
  /**
   * withInitialQueriesWrapper
   *
   * the function that creates our wrapper component and fetches our queries in addition to the next.js page getInitialProps
   *
   * @param getQueries - the set of queries or getter function for getting the queries
   * @param getQueryProps - optional getter for additional context props that will be fed to getQueries
   */
  function withInitialQueriesWrapper(
    getQueries?: Queries<QueryProps> | GetQueries<QueryProps>,
    getQueryProps?: QueryPropsGetter<QueryProps>
  ): NextPage<PageProps> {
    const hasWrappedComponentGetInitialProps =
      typeof WrappedComponent.getInitialProps !== 'undefined';
    const hasCustomGetInitialProps = typeof getInitialProps !== 'undefined';

    // we only want to allow one instance of a getInitial props
    if (hasCustomGetInitialProps && hasWrappedComponentGetInitialProps)
      throw new TypeError(
        '[jotai-query-toolkit] withInitialQueries: The wrapped next.js page has getInitialProps defined, and getInitialProps was passed to withInitialQueries. Please only use one of these.'
      );

    const Wrapper = withInitialQueryData(WrappedComponent, initialValuesAtomBuilders);

    if (typeof getQueries !== 'undefined') {
      Wrapper.getInitialProps = getInitialQueryProps<QueryProps, PageProps>(
        getQueries,
        getQueryProps
      )(getInitialProps || WrappedComponent.getInitialProps);
    } else if (hasCustomGetInitialProps) {
      Wrapper.getInitialProps = getInitialProps;
    } else if (hasWrappedComponentGetInitialProps) {
      Wrapper.getInitialProps = WrappedComponent.getInitialProps;
    }

    return Wrapper as unknown as NextPage<PageProps>;
  }

  return withInitialQueriesWrapper;
}
