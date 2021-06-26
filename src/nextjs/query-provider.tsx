import React from 'react';
import { Provider } from 'jotai';
import { useQueryInitialValues } from './hooks';

import type { QueryKey, QueryClient } from 'react-query';

export interface QueryProviderProps {
  queryKeys: QueryKey[];
  initialQueryData: Record<string, unknown>;
  customQueryClient?: QueryClient;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({
  queryKeys,
  initialQueryData,
  customQueryClient,
  children,
}) => {
  const initialValues = useQueryInitialValues(queryKeys, initialQueryData, customQueryClient);
  return <Provider initialValues={initialValues}>{children}</Provider>;
};
