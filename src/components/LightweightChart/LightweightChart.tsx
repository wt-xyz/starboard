import { getIndexerGraphQLClient } from '@/clients/indexerGraphQL';
import { useAppThemeAndColorModeContext } from '@/hooks/useAppThemeAndColorMode';
import { log } from '@/lib/telemetry';
import { useAppSelector } from '@/state/appTypes';
import { getAppTheme } from '@/state/appUiConfigsSelectors';
import {
    CandlestickData,
    CandlestickSeries,
    ColorType,
    createChart,
    IChartApi,
    ISeriesApi,
    Time
} from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

export interface LightweightChartProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  onChartReady?: () => void;
}

interface PriceData {
  time: number;
  price: number;
}

export const LightweightChart: React.FC<LightweightChartProps> = ({
  symbol,
  width = '100%',
  height = 400,
  onChartReady,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const appTheme = useAppSelector(getAppTheme);
  const colorTheme = useAppThemeAndColorModeContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    // Determine theme colors
    const isDark = appTheme === 'Dark';
    const backgroundColor = isDark ? colorTheme.layer2 : '#ffffff';
    const textColor = isDark ? colorTheme.textSecondary : '#191919';
    const gridColor = isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(42, 46, 57, 0.1)';

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: typeof height === 'number' ? height : chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: gridColor,
      },
      rightPriceScale: {
        borderColor: gridColor,
      },
      crosshair: {
        mode: 1,
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: colorTheme.positive || '#26a69a',
      downColor: colorTheme.negative || '#ef5350',
      borderVisible: false,
      wickUpColor: colorTheme.positive || '#26a69a',
      wickDownColor: colorTheme.negative || '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Fetch and set data
    fetchPriceData(symbol)
      .then((data) => {
        if (seriesRef.current) {
          seriesRef.current.setData(data);
          setIsLoading(false);
          onChartReady?.();
        }
      })
      .catch((error) => {
        log('LightweightChart/fetchPriceData', error);
        setIsLoading(false);
      });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, appTheme, height, colorTheme, onChartReady]);

  return (
    <ChartContainer ref={chartContainerRef} $width={width} $height={height}>
      {isLoading && <LoadingOverlay>Loading chart data...</LoadingOverlay>}
    </ChartContainer>
  );
};

// Fetch price data from indexer
async function fetchPriceData(symbol: string): Promise<CandlestickData[]> {
  try {
    const client = getIndexerGraphQLClient();
    
    if (!client) {
      // Return mock data if no client is available
      log('LightweightChart/fetchPriceData', new Error('No indexer GraphQL client available, using mock data'));
      return generateMockCandleData();
    }

    const asset = extractAssetFromSymbol(symbol);
    const prices = await client.getPrices(asset, 1000);
    
    if (prices.length === 0) {
      log('LightweightChart/fetchPriceData', new Error(`No prices found for asset: ${asset}`));
      return generateMockCandleData();
    }

    // Convert prices to candlestick data
    // Group by time intervals and calculate OHLC
    const candleData = convertPricesToCandles(prices.map(p => ({
      time: p.timestamp,
      price: parseFloat(p.price),
    })));
    
    return candleData;
  } catch (error) {
    log('LightweightChart/fetchPriceData/error', error);
    return generateMockCandleData();
  }
}

function extractAssetFromSymbol(symbol: string): string {
  // Extract asset from symbol (e.g., "BTC-USD" -> "BTC")
  return symbol.split('-')[0] || symbol;
}

function convertPricesToCandles(prices: PriceData[]): CandlestickData[] {
  if (prices.length === 0) return [];

  // Group prices by hour and calculate OHLC
  const candleMap = new Map<number, { open: number; high: number; low: number; close: number; time: number }>();

  prices.forEach((price) => {
    // Round timestamp to hour
    const hourTimestamp = Math.floor(price.time / 3600) * 3600;

    if (!candleMap.has(hourTimestamp)) {
      candleMap.set(hourTimestamp, {
        time: hourTimestamp,
        open: price.price,
        high: price.price,
        low: price.price,
        close: price.price,
      });
    } else {
      const candle = candleMap.get(hourTimestamp)!;
      candle.high = Math.max(candle.high, price.price);
      candle.low = Math.min(candle.low, price.price);
      candle.close = price.price;
    }
  });

  return Array.from(candleMap.values())
    .sort((a, b) => a.time - b.time)
    .map(candle => ({
      ...candle,
      time: candle.time as Time,
    }));
}

function generateMockCandleData(): CandlestickData[] {
  // Generate 100 days of mock candle data
  const data: CandlestickData[] = [];
  let basePrice = 100;
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 86400;

  for (let i = 99; i >= 0; i--) {
    const time = (now - i * dayInSeconds) as Time;
    const volatility = 5;
    const change = (Math.random() - 0.5) * volatility;
    basePrice = Math.max(basePrice + change, 50);

    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;

    data.push({
      time,
      open,
      high,
      low,
      close,
    });
  }

  return data;
}

const ChartContainer = styled.div<{ $width: string | number; $height: string | number }>`
  position: relative;
  width: ${(props) => (typeof props.$width === 'number' ? `${props.$width}px` : props.$width)};
  height: ${(props) => (typeof props.$height === 'number' ? `${props.$height}px` : props.$height)};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.layer2 || '#1e222d'};
  color: ${(props) => props.theme.textPrimary || '#d1d4dc'};
  font-size: 14px;
  z-index: 1;
`;

