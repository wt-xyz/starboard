import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { MarginMode } from '@/bonsai/forms/trade/types';
import { SubaccountFill, SubaccountFillType } from '@/bonsai/types/summaryTypes';
import { useAccounts } from '@/hooks/useAccounts';
import { useGraphQLClient } from '@/lib/graphqlClient';
import { MOCK_TRADE_FILLS } from '@/mocks/tradeHistoryMocks';
import {
  GET_ALL_TRADES_QUERY,
  GraphQLOrderSide,
  GraphQLTrade,
  GraphQLTradesResponse,
} from '@/types/indexer/tradeTypes';

import { IndexerLiquidity, IndexerOrderSide } from '@/types/indexer/indexerApiGen';

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
  const side =
    trade.side === GraphQLOrderSide.BUY ? IndexerOrderSide.BUY : IndexerOrderSide.SELL;

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
  const graphqlClient = useGraphQLClient();

  const { page = 1, pageSize = 25, ticker, startTime, endTime, side } = filters;

  // Calculate offset from page number
  const offset = (page - 1) * pageSize;

  // Check if we should use mock data
  const isLocalhost =
    typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
  // const enableMock = import.meta.env.VITE_ENABLE_TRADE_HISTORY_MOCKS === 'true';
  const enableMock = false;

  const query = useQuery({
    queryKey: [
      'trade-history-graphql',
      address,
      ticker,
      startTime,
      endTime,
      side,
      page,
      pageSize,
    ],
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
        // Fetch trades from GraphQL
        // We fetch more than needed to allow client-side filtering by address
        const response = await graphqlClient.request<GraphQLTradesResponse>(
          GET_ALL_TRADES_QUERY,
          {
            limit: pageSize * 2, // Fetch extra for filtering
            offset: 0, // Start from beginning, filter client-side
          }
        );

        const trades = response.trades ?? [];

        // Filter by connected wallet address
        let filteredTrades = address
          ? trades.filter(
              (trade) =>
                trade.position?.account?.address?.toLowerCase() === address.toLowerCase()
            )
          : trades;

        // Apply additional filters
        if (side) {
          filteredTrades = filteredTrades.filter((trade) => trade.side === side);
        }

        if (ticker) {
          filteredTrades = filteredTrades.filter(
            (trade) =>
              trade.market?.ticker === ticker || trade.position?.ticker === ticker
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

        // Calculate total before pagination
        const totalResults = filteredTrades.length;

        // Apply pagination
        const paginatedTrades = filteredTrades.slice(offset, offset + pageSize);

        // Map to SubaccountFill format
        const fills = paginatedTrades.map(mapGraphQLTradeToFill);

        return {
          fills,
          totalResults,
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
    }),
    [query.data, query.isLoading, query.error]
  );
};
