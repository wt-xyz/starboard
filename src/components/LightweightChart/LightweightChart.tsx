import { useAppThemeAndColorModeContext } from '@/hooks/useAppThemeAndColorMode';
import { useDydxClient } from '@/hooks/useDydxClient';
import { log } from '@/lib/telemetry';
import { mapCandle } from '@/lib/tradingView/utils';
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
import { ResolutionString } from 'public/tradingview/charting_library';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

export interface LightweightChartProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  onChartReady?: () => void;
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
  const dydxClient = useDydxClient();
  const getCandlesForDatafeed = dydxClient?.getCandlesForDatafeed;

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Determine theme colors
    const isDark = appTheme === 'Dark';
    const backgroundColor = isDark ? colorTheme.layer2 : '#ffffff';
    const textColor = isDark ? colorTheme.textSecondary : '#191919';
    const gridColor = isDark ? 'rgba(197, 203, 206, 0.1)' : 'rgba(42, 46, 57, 0.1)';

    // Calculate chart dimensions
    const getChartHeight = () => {
      if (typeof height === 'number') {
        return height;
      }
      // For percentage-based or other string heights, use container's actual height
      // with a minimum fallback to prevent rendering issues
      const containerHeight = chartContainerRef.current?.clientHeight || 0;
      return Math.max(containerHeight, 300); // Minimum 300px height
    };

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
      height: getChartHeight(),
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

    // Handle resize with ResizeObserver for better container size tracking
    const resizeObserver = new ResizeObserver((entries) => {
      if (!chartRef.current || !chartContainerRef.current) return;
      
      const entry = entries[0];
      if (entry) {
        const { width, height: observedHeight } = entry.contentRect;
        chartRef.current.applyOptions({
          width: Math.max(width, 0),
          height: typeof height === 'number' ? height : Math.max(observedHeight, 300),
        });
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    // Fallback window resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: getChartHeight(),
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Check if getCandlesForDatafeed is available
    if (!getCandlesForDatafeed) {
      log('LightweightChart', new Error('getCandlesForDatafeed not available'));
      setIsLoading(false);
      return;
    }

    // Fetch and set data
    fetchCandleData(symbol, getCandlesForDatafeed)
      .then((data) => {
        if (seriesRef.current) {
          seriesRef.current.setData(data);
          setIsLoading(false);
          onChartReady?.();
        }
      })
      .catch((error) => {
        log('LightweightChart/fetchCandleData', error);
        setIsLoading(false);
      });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol, appTheme, height, colorTheme, onChartReady, getCandlesForDatafeed]);

  return (
    <ChartContainer ref={chartContainerRef} $width={width} $height={height}>
      {isLoading && <LoadingOverlay>Loading chart data...</LoadingOverlay>}
    </ChartContainer>
  );
};

// Fetch candle data from dYdX indexer
async function fetchCandleData(
  marketId: string,
  getCandlesForDatafeed: ReturnType<typeof useDydxClient>['getCandlesForDatafeed']
): Promise<CandlestickData[]> {
  try {
    const resolution = '1H' as ResolutionString; // Default to 1 hour candles
    const toMs = Date.now();
    const fromMs = toMs - 100 * 60 * 60 * 1000; // 100 hours of data

    const candles = await getCandlesForDatafeed({
      marketId,
      resolution,
      fromMs,
      toMs,
    });

    if (!candles || candles.length === 0) {
      log('LightweightChart/fetchCandleData', new Error(`No candles found for market: ${marketId}`));
      return [];
    }

    // Convert to lightweight charts format
    const candleData: CandlestickData[] = candles.map((candle) => {
      const tradingViewBar = mapCandle(candle);
      return {
        time: Math.floor(tradingViewBar.time / 1000) as Time,
        open: tradingViewBar.open,
        high: tradingViewBar.high,
        low: tradingViewBar.low,
        close: tradingViewBar.close,
      };
    });

    return candleData;
  } catch (error) {
    log('LightweightChart/fetchCandleData/error', error);
    return [];
  }
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

