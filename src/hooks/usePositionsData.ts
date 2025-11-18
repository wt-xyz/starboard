import { useQuery } from '@tanstack/react-query';

import { log } from '@/lib/telemetry';

import { useDydxClient } from './useDydxClient';

export interface PositionKeyData {
  id: string;
  account: string;
  indexAssetId: string;
  isLong: boolean;
}

export interface PositionData {
  id: string;
  positionKey: PositionKeyData;
  collateralAmout: string;
  size: string;
  timestamp: number;
  latest: boolean;
  change: 'INCREASE' | 'DECREASE' | 'CLOSE' | 'LIQUIDATE';
  collateralTransferred: string;
  positionFee: string;
  fundingRate: string;
  pnlDelta: string;
  realizedFundingRate: string;
  realizedPnl: string;
}

/**
 * Hook to fetch all positions from the GraphQL indexer
 */
export const usePositions = (options?: {
  latestOnly?: boolean;
  account?: string;
  enabled?: boolean;
}) => {
  const { indexerClient } = useDydxClient();

  const queryFn = async () => {
    if (!indexerClient?.positions) {
      return [];
    }

    try {
      return await indexerClient.positions.getPositions({
        latestOnly: options?.latestOnly,
        account: options?.account,
        orderBy: 'timestamp_DESC',
      });
    } catch (error) {
      log('usePositions/getPositions', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['positions', options?.latestOnly, options?.account],
    queryFn,
    enabled: options?.enabled !== false && Boolean(indexerClient?.positions),
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
};

/**
 * Hook to fetch positions for a specific account
 */
export const useAccountPositions = (account?: string, options?: { enabled?: boolean }) => {
  const { indexerClient } = useDydxClient();

  const queryFn = async () => {
    if (!indexerClient?.positions || !account) {
      return [];
    }

    try {
      return await indexerClient.positions.getLatestPositionsByAccount(account);
    } catch (error) {
      log('useAccountPositions/getLatestPositionsByAccount', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['accountPositions', account],
    queryFn,
    enabled: options?.enabled !== false && Boolean(indexerClient?.positions && account),
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
};

/**
 * Hook to fetch position history for an account
 */
export const usePositionHistory = (
  account?: string,
  indexAssetId?: string,
  options?: { enabled?: boolean; limit?: number }
) => {
  const { indexerClient } = useDydxClient();

  const queryFn = async () => {
    if (!indexerClient?.positions || !account) {
      return [];
    }

    try {
      return await indexerClient.positions.getPositionHistory(
        account,
        indexAssetId,
        options?.limit
      );
    } catch (error) {
      log('usePositionHistory/getPositionHistory', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['positionHistory', account, indexAssetId, options?.limit],
    queryFn,
    enabled: options?.enabled !== false && Boolean(indexerClient?.positions && account),
    staleTime: 10_000, // 10 seconds
  });
};

/**
 * Hook to fetch position keys
 */
export const usePositionKeys = (options?: {
  account?: string;
  indexAssetId?: string;
  isLong?: boolean;
  enabled?: boolean;
}) => {
  const { indexerClient } = useDydxClient();

  const queryFn = async () => {
    if (!indexerClient?.positions) {
      return [];
    }

    try {
      return await indexerClient.positions.getPositionKeys({
        account: options?.account,
        indexAssetId: options?.indexAssetId,
        isLong: options?.isLong,
      });
    } catch (error) {
      log('usePositionKeys/getPositionKeys', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['positionKeys', options?.account, options?.indexAssetId, options?.isLong],
    queryFn,
    enabled: options?.enabled !== false && Boolean(indexerClient?.positions),
    staleTime: 60_000, // 1 minute
  });
};
