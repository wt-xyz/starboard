import { type FC, useCallback, useRef, useState } from 'react';
import { Button, Flex } from '@radix-ui/themes';
import type { Candle, CandleInterval } from 'fuel-ts-sdk/trading';
import { TradingChart, type TradingChartHandle } from '@/components/TradingChart';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';

export const DashboardTradingChart: FC = () => {
  const tradingSdk = useTradingSdk();
  const asset = useSdkQuery(() => tradingSdk.getWatchedAsset());
  const tradingChartRef = useRef<TradingChartHandle | null>(null);
  const [isWidgetbarOpen, setIsWidgetbarOpen] = useState(false);

  const getOrFetchCandles = useCallback(
    async (interval: CandleInterval): Promise<Candle[]> => {
      if (!asset) return [];
      const status = tradingSdk.getCandlesStatus(asset.assetId, interval);

      if (status === 'uninitialized') {
        await tradingSdk.fetchCandles(asset.assetId, interval);
      }

      return tradingSdk.getCandles(asset.assetId, interval);
    },
    [asset, tradingSdk]
  );

  return (
    <Flex direction="column" gap="2" style={{ height: '100%' }}>
      <Flex justify="end">
        <Button
          variant="soft"
          color="gray"
          onClick={() => {
            setIsWidgetbarOpen((prev) => {
              const next = !prev;
              tradingChartRef.current?.setWidgetbarVisible(next);
              return next;
            });
          }}
        >
          {isWidgetbarOpen ? 'Hide panels' : 'Show panels'}
        </Button>
      </Flex>
      <TradingChart ref={tradingChartRef} symbol={asset?.symbol ?? '?'} candlesGetter={getOrFetchCandles} />
    </Flex>
  );
};
