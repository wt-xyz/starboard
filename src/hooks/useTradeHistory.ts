import { useMemo } from 'react';

import { MarginMode } from '@/bonsai/forms/trade/types';
import { SubaccountFill, SubaccountFillType } from '@/bonsai/types/summaryTypes';
import { MOCK_TRADE_FILLS } from '@/mocks/tradeHistoryMocks';
import { useQuery } from '@tanstack/react-query';

import { IndexerLiquidity, IndexerOrderSide } from '@/types/indexer/indexerApiGen';

import { useAccounts } from '@/hooks/useAccounts';

import { useGraphQLIndexerClient } from '@/lib/graphqlClient';

// Trade type returned by ts-sdk GraphQLIndexerClient
interface GraphQLTrade {
  id: string;
  createdAt?: string | null;
  createdAtHeight?: number | null;
  side?: 'BUY' | 'SELL' | null;
  price?: string | null;
  size?: string | null;
  tradeType?: string | null;
  market?: { id: string; ticker: string; oraclePrice?: string | null } | null;
  position?: {
    id: string;
    side?: string | null;
    ticker?: string | null;
    account?: { id: string; address?: string | null; subaccountNumber?: number } | null;
  } | null;
}

export type TradeHistoryFilter = {
  ticker?: string;
  startTime?: string; // ISO
  endTime?: string; // ISO
  side?: 'BUY' | 'SELL';
  page?: number;
  pageSize?: number;
};

/**
 * Maps a GraphQL Trade to the SubaccountFill format expected by the UI.
 *
 * Key mappings:
 * - GraphQL Trade doesn't have fee/liquidity fields, so we use defaults
 * - All trades are TAKER since pool-based (no order book)
 * - tradeType is always "Limit" from indexer but we map to MARKET
 */
const mapGraphQLTradeToFill = (trade: GraphQLTrade): SubaccountFill => {
  // Map GraphQL OrderSide to IndexerOrderSide
  const side = trade.side === 'BUY' ? IndexerOrderSide.BUY : IndexerOrderSide.SELL;

  return {
    id: trade.id,
    side,
    // Pool-based system = all trades are effectively TAKER
    liquidity: IndexerLiquidity.TAKER,
    // Map to MARKET since pool-based (no limit orders)
    type: SubaccountFillType.MARKET,
    marketType: undefined,
    price: trade.price ?? '0',
    size: trade.size ?? '0',
    // Fee not available in GraphQL schema - default to '0'
    fee: '0',
    affiliateRevShare: undefined,
    createdAt: trade.createdAt ?? undefined,
    createdAtHeight: trade.createdAtHeight?.toString() ?? undefined,
    orderId: undefined,
    clientMetadata: undefined,
    subaccountNumber: trade.position?.account?.subaccountNumber ?? 0,
    // Use market ticker or position ticker
    market: trade.market?.ticker ?? trade.position?.ticker ?? '',
    // Default to CROSS margin mode
    marginMode: MarginMode.CROSS,
  };
};

export const useTradeHistory = (filters: TradeHistoryFilter) => {
  const { address } = useAccounts();
  const indexerClient = useGraphQLIndexerClient();

  const { page = 1, pageSize = 25, ticker, startTime, endTime, side } = filters;

  // Calculate offset from page number
  const offset = (page - 1) * pageSize;

  // Check if we should use mock data
  const isLocalhost =
    typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
  // const enableMock = import.meta.env.VITE_ENABLE_TRADE_HISTORY_MOCKS === 'true';
  const enableMock = false;

  const query = useQuery({
    queryKey: ['trade-history-graphql', address, ticker, startTime, endTime, side, page, pageSize],
    enabled: true,
    staleTime: 30_000, // 30 seconds
    queryFn: async () => {
      // If mock mode enabled, use mock data
      if (enableMock) {
        const mockFills = MOCK_TRADE_FILLS as SubaccountFill[];
        return {
          fills: mockFills,
          totalResults: mockFills.length,
        };
      }

      try {
        // Use ts-sdk GraphQLIndexerClient methods
        let trades: GraphQLTrade[];

        if (address) {
          console.log('calling indexer in useTradeHistory with address:', address);
          // Use server-side filtering by account address for efficiency
          trades = await indexerClient.getAccountTrades(address, pageSize, offset);
        } else {
          console.log('calling indexer in useTradeHistory with no address');
          // No address - fetch all trades (for admin/demo views)
          trades = await indexerClient.getAllTrades(pageSize, offset);
        }

        // Apply additional client-side filters (side, ticker, date range)
        // Note: These could be moved to server-side if the indexer supports them
        let filteredTrades = trades;

        if (side) {
          filteredTrades = filteredTrades.filter((trade) => trade.side === side);
        }

        if (ticker) {
          filteredTrades = filteredTrades.filter(
            (trade) => trade.market?.ticker === ticker || trade.position?.ticker === ticker
          );
        }

        if (startTime) {
          const startDate = new Date(startTime);
          filteredTrades = filteredTrades.filter(
            (trade) => trade.createdAt && new Date(trade.createdAt) >= startDate
          );
        }

        if (endTime) {
          const endDate = new Date(endTime);
          filteredTrades = filteredTrades.filter(
            (trade) => trade.createdAt && new Date(trade.createdAt) <= endDate
          );
        }

        // Map to SubaccountFill format
        const fills = filteredTrades.map(mapGraphQLTradeToFill);

        // Note: totalResults is approximate since we're paginating server-side
        // For exact count, we'd need a separate count query or use tradesConnection
        return {
          fills,
          totalResults: fills.length < pageSize ? offset + fills.length : offset + pageSize + 1,
        };
      } catch (error) {
        // On error, fall back to mock data in localhost
        if (isLocalhost) {
          console.warn('GraphQL query failed, falling back to mock data:', error);
          const mockFills = MOCK_TRADE_FILLS as SubaccountFill[];
          return {
            fills: mockFills,
            totalResults: mockFills.length,
          };
        }
        throw error;
      }
    },
  });

  return useMemo(
    () => ({
      fills: query.data?.fills ?? [],
      totalResults: query.data?.totalResults ?? 0,
      isLoading: query.isLoading,
      error: query.error as Error | null,
      refetch: query.refetch,
    }),
    [query.data, query.isLoading, query.error]
  );
};
