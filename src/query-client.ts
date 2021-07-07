import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    // @see https://github.com/tannerlinsley/react-query/discussions/1601
    // @see https://react-query.tanstack.com/guides/migrating-to-react-query-3#the-queryoptionsnotifyonstatuschange-option-has-been-superceded-by-the-new-notifyonchangeprops-and-notifyonchangepropsexclusions-options
    queries: {
      notifyOnChangeProps: [
        'data',
        'error',
        'isFetchingNextPage',
        'isFetchingPreviousPage',
        'hasNextPage',
        'hasPreviousPage',
      ],
    },
  },
});
