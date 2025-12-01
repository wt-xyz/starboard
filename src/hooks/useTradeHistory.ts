import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { BonsaiCore } from '@/bonsai/ontology';
import { useAccounts } from '@/hooks/useAccounts';
import { useDydxClient } from '@/hooks/useDydxClient';
import { useAppSelector } from '@/state/appTypes';
import { MOCK_TRADE_FILLS } from '@/mocks/tradeHistoryMocks';

export type TradeHistoryFilter = {
  ticker?: string;
  startTime?: string; // ISO
  endTime?: string; // ISO
  side?: 'BUY' | 'SELL';
  page?: number;
  pageSize?: number;
};

export const useTradeHistory = (filters: TradeHistoryFilter) => {
  const { address } = useAccounts();
  const { indexerClient } = useDydxClient();
  const bonsaiFills = useAppSelector(BonsaiCore.account.fills.data) ?? [];

  const { page = 1, pageSize = 25, ticker, startTime, endTime, side } = filters;
  const isLocalhost =
    typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
  const enableMock =
    (import.meta.env.VITE_ENABLE_TRADE_HISTORY_MOCKS === 'true' || isLocalhost) &&
    bonsaiFills.length === 0;

  const query = useQuery({
    queryKey: ['trade-history', address, ticker, startTime, endTime, side, page, pageSize],
    // We always run so we at least return Bonsai data; no need for the REST endpoint that isn't in docker.
    enabled: true,
    queryFn: async () => {
      const fills = (enableMock ? MOCK_TRADE_FILLS : bonsaiFills) as any[];

      const filtered = fills.filter((fill) => {
        if (side && fill.side !== side) return false;
        if (startTime && fill.createdAt && new Date(fill.createdAt) < new Date(startTime)) {
          return false;
        }
        return true;
      });

      return {
        fills: filtered,
        totalResults: filtered.length,
      };
    },
  });

  return useMemo(
    () => ({
      fills: (query.data?.fills as any[]) ?? [],
      totalResults: query.data?.totalResults ?? 0,
      isLoading: query.isLoading,
      error: query.error as Error | null,
    }),
    [query.data, query.isLoading, query.error]
  );
};
