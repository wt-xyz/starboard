import { useMemo } from 'react';

import { GraphQLClient } from 'graphql-request';

import { useEndpointsConfig } from '@/hooks/useEndpointsConfig';

/**
 * Creates a GraphQL client connected to the indexer's GraphQL endpoint.
 * The endpoint is determined by the current network configuration.
 *
 * Endpoints:
 * - Localhost: http://localhost:4350/graphql
 * - Testnet: https://indexer.v4testnet.dydx.exchange/graphql
 */
export const useGraphQLClient = () => {
  const { indexer } = useEndpointsConfig();

  const client = useMemo(() => {
    const endpoint = `${indexer.api}/graphql`;
    return new GraphQLClient(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, [indexer.api]);

  return client;
};

/**
 * Creates a standalone GraphQL client for use outside of React components.
 * @param indexerApiUrl - The base URL of the indexer API
 */
export const createGraphQLClient = (indexerApiUrl: string) => {
  return new GraphQLClient(`${indexerApiUrl}/graphql`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

