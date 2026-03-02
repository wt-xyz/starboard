import { forwardRef, use, useEffect, useImperativeHandle, useRef } from 'react';
import type { Candle, CandleInterval } from 'fuel-ts-sdk/trading';
import type {
  ChartingLibraryFeatureset,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from 'public/tradingview/charting_library';
import { ThemeContext } from '@/contexts/ThemeContext';
import * as styles from './TradingChart.css';
import { createTradingViewCustomCssUrl, tradingViewThemes } from './TradingChart.theme';
import { createDatafeed } from './TradingChart.utils';

export interface TradingChartProps {
  symbol: string;
  candlesGetter: (interval: CandleInterval) => Promise<Candle[]>;
}

export interface TradingChartHandle {
  setWidgetbarVisible: (visible: boolean) => void;
}

export const TradingChart = forwardRef<TradingChartHandle, TradingChartProps>(function TradingChart(
  { symbol, candlesGetter }: TradingChartProps,
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<IChartingLibraryWidget | null>(null);
  const customCssUrlRef = useRef<string | null>(null);
  const { theme } = use(ThemeContext)!;

  useImperativeHandle(
    ref,
    () => ({
      setWidgetbarVisible: (visible: boolean) => {
        widgetRef.current
          ?.widgetbar()
          .then((widgetbar) => widgetbar.changeWidgetBarVisibility(visible))
          .catch(() => {});
      },
    }),
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const tv = tradingViewThemes[theme];

    if (customCssUrlRef.current) URL.revokeObjectURL(customCssUrlRef.current);
    customCssUrlRef.current = createTradingViewCustomCssUrl(tv);

    // Detect mobile/touch devices
    const isMobile =
      window.matchMedia('(max-width: 640px)').matches ||
      window.matchMedia('(pointer: coarse)').matches;

    const themeOverrides: ChartingLibraryWidgetOptions['overrides'] = {
      'paneProperties.backgroundType': 'solid',
      'paneProperties.background': tv.cardBg,
      'paneProperties.backgroundGradientStartColor': tv.cardBg,
      'paneProperties.backgroundGradientEndColor': tv.cardBg,
      'paneProperties.vertGridProperties.color': tv.borderDefault,
      'paneProperties.horzGridProperties.color': tv.borderDefault,
      'paneProperties.vertGridProperties.style': 2,
      'paneProperties.horzGridProperties.style': 2,
      'paneProperties.separatorColor': tv.separatorColor,
      'scalesProperties.axisHighlightColor': tv.highlightColor,
      'scalesProperties.axisLineToolLabelBackgroundColorCommon': tv.primary,
      'scalesProperties.axisLineToolLabelBackgroundColorActive': tv.primary,
      // Consistent font sizes: 9px minimum for readability on mobile
      'scalesProperties.fontSize': isMobile ? 9 : 11,
      // Candle colors matching design system
      'mainSeriesProperties.candleStyle.upColor': tv.candleUp,
      'mainSeriesProperties.candleStyle.downColor': tv.candleDown,
      'mainSeriesProperties.candleStyle.wickUpColor': tv.candleUp,
      'mainSeriesProperties.candleStyle.wickDownColor': tv.candleDown,
      'mainSeriesProperties.candleStyle.borderUpColor': tv.candleUp,
      'mainSeriesProperties.candleStyle.borderDownColor': tv.candleDown,
    };

    // Compact price formatter for mobile (shows 84.0K instead of 84000)
    const formatCompactPrice = (price: number): string => {
      const abs = Math.abs(price);
      const sign = price < 0 ? '-' : '';
      if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1) + 'B';
      if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M';
      if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + 'K';
      return sign + abs.toFixed(2);
    };

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol,
      datafeed: createDatafeed(candlesGetter),
      interval: '15' as ResolutionString,
      container: containerRef.current,
      library_path: '/tradingview/',
      locale: 'en',
      custom_css_url: customCssUrlRef.current,
      // Use compact formatter on mobile to prevent Y-axis cutoff
      ...(isMobile
        ? {
            custom_formatters: {
              priceFormatterFactory: () => ({
                format: (price: number) => formatCompactPrice(price),
              }),
            },
          }
        : {}),
      loading_screen: {
        backgroundColor: tv.cardBg,
        foregroundColor: tv.primary,
      },
      disabled_features: [
        'trading_account_manager' as ChartingLibraryFeatureset,
        'use_localstorage_for_settings' as ChartingLibraryFeatureset,
        'timeframes_toolbar' as ChartingLibraryFeatureset,
        'header_compare' as ChartingLibraryFeatureset,
        'header_symbol_search' as ChartingLibraryFeatureset,
        'symbol_search_hot_key' as ChartingLibraryFeatureset,
        'header_undo_redo' as ChartingLibraryFeatureset,
        'header_saveload' as ChartingLibraryFeatureset,
        'header_quick_search' as ChartingLibraryFeatureset,
        'display_market_status' as ChartingLibraryFeatureset,
        'symbol_info' as ChartingLibraryFeatureset,
        'volume_force_overlay' as ChartingLibraryFeatureset,
        'create_volume_indicator_by_default' as ChartingLibraryFeatureset,
        'popup_hints' as ChartingLibraryFeatureset,
        'edit_buttons_in_legend' as ChartingLibraryFeatureset,
      ],
      enabled_features: [
        'iframe_loading_same_origin' as ChartingLibraryFeatureset,
        'hide_left_toolbar_by_default' as ChartingLibraryFeatureset,
        'chart_crosshair_menu' as ChartingLibraryFeatureset,
        'items_favoriting' as ChartingLibraryFeatureset,
      ],
      load_last_chart: false,
      theme: tv.tvTheme,
      fullscreen: false,
      autosize: true,
      studies_overrides: {},
      overrides: {
        ...themeOverrides,
      },
    };

    const widget = new window.TradingView.widget(widgetOptions);

    widget.onChartReady(() => {
      widget.applyOverrides(themeOverrides);

      // Hide the right sidebar by default
      widget
        .widgetbar()
        .then((widgetbar) => widgetbar.changeWidgetBarVisibility(false))
        .catch(() => {});

      widgetRef.current = widget;
    });

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
      if (customCssUrlRef.current) {
        URL.revokeObjectURL(customCssUrlRef.current);
        customCssUrlRef.current = null;
      }
    };
  }, [candlesGetter, symbol, theme]);

  return <div ref={containerRef} css={styles.container} />;
});
