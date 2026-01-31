import { colors } from '@/styles/colors';
import type { Candle, CandleInterval } from 'fuel-ts-sdk/trading';
import type {
  ChartingLibraryFeatureset,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from 'public/tradingview/charting_library';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as styles from './TradingChart.css';
import { createDatafeed } from './TradingChart.utils';

export interface TradingChartProps {
  symbol: string;
  candlesGetter: (interval: CandleInterval) => Promise<Candle[]>;
}

export interface TradingChartHandle {
  setWidgetbarVisible: (visible: boolean) => void;
}

function createTradingViewCustomCssUrl(): string {
  const css = `
@import url("/tradingview/custom-styles.css");

/* Starboard: match dashboard panel grey for the Object Tree panel container. */
.wrap-ukH4sVzT,
.wrap-ukH4sVzT .space-ukH4sVzT,
.wrap-ukH4sVzT .tree-ukH4sVzT {
  background-color: ${colors.gluonGrey} !important;
}

/* Starboard: remove blue selection highlight in the Object Tree list. */
.wrap-IEe5qpW4,
html.theme-dark .wrap-IEe5qpW4 {
  background-color: ${colors.gluonGrey} !important;
}

@media (any-hover:hover) {
  .wrap-IEe5qpW4:hover,
  html.theme-dark .wrap-IEe5qpW4:hover {
    background-color: ${colors.slateGrey} !important;
  }
}

.wrap-IEe5qpW4.selected-IEe5qpW4,
html.theme-dark .wrap-IEe5qpW4.selected-IEe5qpW4,
.wrap-IEe5qpW4.childOfSelected-IEe5qpW4,
html.theme-dark .wrap-IEe5qpW4.childOfSelected-IEe5qpW4 {
  background-color: ${colors.slateGrey} !important;
}

@media (any-hover:hover) {
  .wrap-IEe5qpW4.selected-IEe5qpW4:hover,
  html.theme-dark .wrap-IEe5qpW4.selected-IEe5qpW4:hover,
  .wrap-IEe5qpW4.childOfSelected-IEe5qpW4:hover,
  html.theme-dark .wrap-IEe5qpW4.childOfSelected-IEe5qpW4:hover {
    background-color: ${colors.slateGrey} !important;
  }
}

/* Starboard: use Liquid Lava as TradingView active accent. */
:root, html, body {
  --color-accent: ${colors.liquidLava} !important;
  --tv-color-platform-background: ${colors.gluonGrey} !important;
  --tv-color-pane-background: ${colors.gluonGrey} !important;
  --tv-color-toolbar-button-background-active: ${colors.liquidLava} !important;
  --tv-color-toolbar-button-background-active-hover: ${colors.liquidLava} !important;
  --tv-color-toolbar-button-text-active: ${colors.snow} !important;
  --tv-color-toolbar-button-text-active-hover: ${colors.snow} !important;
  --tv-color-popup-element-background-active: ${colors.liquidLava} !important;
  --tv-color-popup-element-toolbox-background-active-hover: ${colors.liquidLava} !important;
  --tv-color-item-active-text: ${colors.snow} !important;
}

/* Remove left padding/margin from chart */
.chart-markup-table {
  margin-left: 0 !important;
  padding-left: 0 !important;
}
.layout__area--left {
  display: none !important;
}
`;

  return URL.createObjectURL(new Blob([css], { type: 'text/css' }));
}

export const TradingChart = forwardRef<TradingChartHandle, TradingChartProps>(function TradingChart(
  { symbol, candlesGetter }: TradingChartProps,
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<IChartingLibraryWidget | null>(null);
  const customCssUrlRef = useRef<string | null>(null);

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
    if (!customCssUrlRef.current) customCssUrlRef.current = createTradingViewCustomCssUrl();

    // Detect mobile/touch devices
    const isMobile = window.matchMedia('(max-width: 640px)').matches || 
                     window.matchMedia('(pointer: coarse)').matches;

    const themeOverrides: ChartingLibraryWidgetOptions['overrides'] = {
      'paneProperties.backgroundType': 'solid',
      'paneProperties.background': colors.gluonGrey,
      'paneProperties.backgroundGradientStartColor': colors.gluonGrey,
      'paneProperties.backgroundGradientEndColor': colors.gluonGrey,
      'paneProperties.vertGridProperties.color': colors.whiteAlpha[8],
      'paneProperties.horzGridProperties.color': colors.whiteAlpha[8],
      'paneProperties.vertGridProperties.style': 0,
      'paneProperties.horzGridProperties.style': 0,
      'paneProperties.separatorColor': colors.darkVoidAlpha[20],
      'scalesProperties.axisHighlightColor': colors.liquidLavaAlpha[15],
      'scalesProperties.axisLineToolLabelBackgroundColorCommon': colors.liquidLava,
      'scalesProperties.axisLineToolLabelBackgroundColorActive': colors.liquidLava,
      // Consistent font sizes: smaller on mobile, normal on desktop
      'scalesProperties.fontSize': isMobile ? 6 : 11,
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
      ...(isMobile ? {
        custom_formatters: {
          priceFormatterFactory: () => ({
            format: (price: number) => formatCompactPrice(price),
          }),
        },
      } : {}),
      loading_screen: {
        backgroundColor: colors.gluonGrey,
        foregroundColor: colors.liquidLava,
      },
      disabled_features: [
        'trading_account_manager' as ChartingLibraryFeatureset,
        'use_localstorage_for_settings' as ChartingLibraryFeatureset,
      ],
      enabled_features: [
        'iframe_loading_same_origin' as ChartingLibraryFeatureset,
        'hide_left_toolbar_by_default' as ChartingLibraryFeatureset,
      ],
      load_last_chart: false,
      theme: 'Dark',
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
  }, [candlesGetter, symbol]);

  return <div ref={containerRef} css={styles.container} />;
});
