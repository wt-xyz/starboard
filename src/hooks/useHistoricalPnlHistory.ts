import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAccounts } from '@/hooks/useAccounts';
import { useDydxClient } from '@/hooks/useDydxClient';

type HistoricalPnlFilters = {
  startTime?: string;
  endTime?: string;
};

const MOCK_PNL_HISTORY = [
  { blockTime: '2024-01-01T00:00:00.000Z', totalPnl: '0' },
  { blockTime: '2024-01-02T00:00:00.000Z', totalPnl: '250' },
  { blockTime: '2024-01-03T00:00:00.000Z', totalPnl: '500' },
  { blockTime: '2024-01-04T00:00:00.000Z', totalPnl: '450' },
];

export const useHistoricalPnlHistory = ({ startTime, endTime }: HistoricalPnlFilters = {}) => {
  const { address } = useAccounts();
  const { indexerClient } = useDydxClient();
  const isLocalhost =
    typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
  const enableMock =
    (import.meta.env.VITE_ENABLE_TRADE_HISTORY_MOCKS === 'true' || isLocalhost) && !address;

  const query = useQuery({
    queryKey: ['historical-pnl', address, startTime, endTime],
    enabled: Boolean(address && indexerClient) || enableMock,
    queryFn: async () => {
      if (enableMock) return { historicalPnl: MOCK_PNL_HISTORY };
      if (!address || !indexerClient) return { historicalPnl: [] };

      const response: any = await indexerClient.account.getParentSubaccountNumberHistoricalPNLs(
        address,
        0,
        undefined, // createdBeforeOrAtHeight
        endTime ?? undefined,
        undefined, // createdOnOrAfterHeight
        startTime ?? undefined,
        500,
        1
      );

      return {
        historicalPnl: response?.historicalPnl ?? [],
      };
    },
  });

  const history = query.data?.historicalPnl ?? [];

  const latest = history[history.length - 1];
  const totalPnl = latest?.totalPnl;

  return useMemo(
    () => ({
      history,
      totalPnl,
      isLoading: query.isLoading,
      error: query.error as Error | null,
    }),
    [history, totalPnl, query.isLoading, query.error]
  );
};
