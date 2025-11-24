import { useEffect } from 'react';

import { loadableLoaded } from '@/bonsai/lib/loadable';
import { transformMarkets } from '@/bonsai/lib/marketUtils';
import { wrapAndLogBonsaiError } from '@/bonsai/logs';
import { useCompositeClientManager } from '@/bonsai/rest/lib/useIndexer';
import { selectIndexerClientKey, selectWebsocketUrl } from '@/bonsai/socketSelectors';
import { MARKETS_WEBSOCKET_ENABLED } from '@/bonsai/websocket/markets';
import { useQuery } from '@tanstack/react-query';

import { timeUnits } from '@/constants/time';

import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { setAllMarketsRaw } from '@/state/raw';

/**
 * Polls oracle prices to auto-recalculate position PnL.
 * Only active when WebSocket is unavailable or disabled.
 */
export function useOraclePricePolling() {
  const dispatch = useAppDispatch();
  const clientManager = useCompositeClientManager();
  const indexerClient = clientManager?.indexer.client;
  const indexerKey = useAppSelector(selectIndexerClientKey);
  const wsUrl = useAppSelector(selectWebsocketUrl);

  const hasWebsocketUrl = Boolean(wsUrl);
  const shouldPoll = (!hasWebsocketUrl || !MARKETS_WEBSOCKET_ENABLED) && Boolean(indexerClient);

  const marketsQuery = useQuery({
    enabled: shouldPoll,
    queryKey: ['oraclePrices', 'markets', indexerKey],
    queryFn: wrapAndLogBonsaiError(async () => {
      if (!indexerClient) {
        throw new Error('Indexer client not found');
      }

      const result = await indexerClient.markets.getPerpetualMarkets();

      return result;
    }, 'oraclePricePolling'),
    refetchInterval: timeUnits.second * 10,
    staleTime: timeUnits.second,
  });

  useEffect(() => {
    if (marketsQuery.data?.markets) {
      const transformedMarkets = transformMarkets(marketsQuery.data.markets);
      dispatch(setAllMarketsRaw(loadableLoaded(transformedMarkets)));
    }
  }, [marketsQuery.data, dispatch]);
}
