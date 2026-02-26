import { type FC, useCallback } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import type { Candle, CandleInterval } from 'fuel-ts-sdk/trading';
import { TradingChart } from '@/@starboard/components/TradingChart';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';

export const DashboardTradingChart: FC = () => {
  const tradingSdk = useTradingSdk();
  const asset = useSdkQuery(() => tradingSdk.getWatchedAsset());
  const latestPrice = useSdkQuery(tradingSdk.getWatchedAssetLatestPrice);
  const currentPrice = latestPrice ? $decimalValue(latestPrice.value).toFloat() : undefined;

  const getOrFetchCandles = useCallback(
    async (interval: CandleInterval): Promise<Candle[]> => {
      if (!asset) return [];
      const status = tradingSdk.getCandlesStatus(asset.assetId, interval);

      if (status !== 'fulfilled') {
        await tradingSdk.fetchCandles(asset.assetId, interval);
      }

      return tradingSdk.getCandles(asset.assetId, interval);
    },
    [asset, tradingSdk]
  );

  return (
    <TradingChart
      symbol={asset?.symbol ?? '?'}
      candlesGetter={getOrFetchCandles}
      currentPrice={currentPrice}
    />
  );
};
