import { GetQueries, Queries, QueryPropsGetter } from './types';
import { NextPageContext } from 'next';
import { getInitialPropsFromQueries } from './get-initial-props-from-queries';
import { queryClient } from 'jotai-query-toolkit';

export type GetInitialProps<PageProps> = (
  context: NextPageContext
) => PageProps | Promise<PageProps>;

export function getInitialQueryProps<QueryProps = undefined, PageProps = any>(
  getQueries: Queries<QueryProps> | GetQueries<QueryProps>,
  getQueryProps?: QueryPropsGetter<QueryProps>
) {
  return (getInitialProps?: GetInitialProps<PageProps>) => {
    return async (ctx: NextPageContext): Promise<PageProps> => {
      async function _getInitialProps(): Promise<{} | PageProps> {
        try {
          if (getInitialProps) return getInitialProps(ctx);
          return {};
        } catch (e) {
          console.error(
            `[jotai-query-toolkit] getInitialQueryProps: getInitialProps failed. message:`
          );
          console.error(e);
          return {};
        }
      }

      const promises: Promise<any>[] = [
        getInitialPropsFromQueries<QueryProps>({
          getQueries,
          getQueryProps,
          ctx,
          queryClient,
        }),
        _getInitialProps(),
      ];

      const [initialQueryData, initialProps] = await Promise.all(promises);

      return {
        ...initialProps,
        initialQueryData,
      };
    };
  };
}
