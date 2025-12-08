import { useMemo } from 'react';

import { GraphQLIndexerClient, GraphQLIndexerConfig } from 'starboard-client-js';

import { useEndpointsConfig } from '@/hooks/useEndpointsConfig';

/**
 * Creates a GraphQL indexer client connected to the Squid indexer.
 * Uses the ts-sdk's GraphQLIndexerClient for consistency.
 *
 * Endpoints:
 * - Localhost: http://localhost:4350/graphql
 * - Testnet: https://indexer.v4testnet.dydx.exchange/graphql
 */
export const useGraphQLIndexerClient = () => {
  const { indexer } = useEndpointsConfig();

  const client = useMemo(() => {
    const config = new GraphQLIndexerConfig(indexer.api);
    return new GraphQLIndexerClient(config);
  }, [indexer.api]);

  return client;
};

/**
 * Creates a standalone GraphQL indexer client for use outside of React components.
 * @param indexerApiUrl - The base URL of the indexer API
 */
export const createGraphQLIndexerClient = (indexerApiUrl: string) => {
  const config = new GraphQLIndexerConfig(indexerApiUrl);
  return new GraphQLIndexerClient(config);
};
