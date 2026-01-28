import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Candle, CandleInterval } from 'fuel-ts-sdk/trading';
import type {
  ChartingLibraryFeatureset,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
} from 'public/tradingview/charting_library';
import { colors } from '@/styles/colors';
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
  // Keep the existing TradingView theme file intact, but layer our Starboard overrides after it.
  // This avoids editing any CSS files and avoids runtime DOM injection into the iframe.
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

/* Starboard: use Liquid Lava as TradingView active accent (fixes blue active widgetbar icon). */
:root, html, body {
  --color-accent: ${colors.liquidLava} !important;

  /* Starboard: remove the subtle bluish frame/padding around the chart (use gluonGrey). */
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

    const lavaOverrides: ChartingLibraryWidgetOptions['overrides'] = {
      // Canvas / pane background
      'paneProperties.backgroundType': 'solid',
      'paneProperties.background': colors.darkVoid,
      'paneProperties.backgroundGradientStartColor': colors.darkVoid,
      'paneProperties.backgroundGradientEndColor': colors.darkVoid,
      // Make grid lines visible (higher contrast on darkVoid)
      'paneProperties.vertGridProperties.color': colors.whiteAlpha[8],
      'paneProperties.horzGridProperties.color': colors.whiteAlpha[8],
      'paneProperties.vertGridProperties.style': 0,
      'paneProperties.horzGridProperties.style': 0,
      // Pane separators (between main pane and volume/indicators)
      'paneProperties.separatorColor': colors.darkVoidAlpha[20],

      // Scale highlight defaults are blue; align them with the design system.
      'scalesProperties.axisHighlightColor': colors.liquidLavaAlpha[15],
      'scalesProperties.axisLineToolLabelBackgroundColorCommon': colors.liquidLava,
      'scalesProperties.axisLineToolLabelBackgroundColorActive': colors.liquidLava,
    };

    const mobileOverridesBase: ChartingLibraryWidgetOptions['overrides'] = {
      // Reduce clutter on small screens.
      'paneProperties.legendProperties.showLegend': false,
    };

    const formatCompactPrice = (price: number): string => {
      const abs = Math.abs(price);
      const sign = price < 0 ? '-' : '';

      if (abs >= 1_000_000_000) {
        return sign + (abs / 1_000_000_000).toFixed(2) + 'B';
      }
      if (abs >= 1_000_000) {
        return sign + (abs / 1_000_000).toFixed(2) + 'M';
      }
      if (abs >= 1_000) {
        return sign + (abs / 1_000).toFixed(2) + 'K';
      }
      return sign + abs.toFixed(2);
    };

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol,
      datafeed: createDatafeed(candlesGetter),
      interval: '15' as ResolutionString,
      container: containerRef.current,
      library_path: '/tradingview/',
      locale: 'en',
      custom_formatters: {
        priceFormatterFactory: () => ({
          format: (price: number) => formatCompactPrice(price),
        }),
      },
      // Global TradingView theming (toolbars, side panels, dialogs, etc.)
      // This is loaded by TradingView (typically inside its chart iframe), and is the most reliable way
      // to eliminate default blue accents.
      custom_css_url: customCssUrlRef.current,
      loading_screen: {
        backgroundColor: colors.darkVoid,
        foregroundColor: colors.liquidLava,
      },
      // Prevent chart properties from being pulled from localStorage and overriding our theme/overrides.
      disabled_features: [
        'trading_account_manager' as ChartingLibraryFeatureset,
        'use_localstorage_for_settings' as ChartingLibraryFeatureset,
        ...(window.matchMedia('(max-width: 550px)').matches
          ? ([
              // Mobile: remove header clutter (common set from TradingView integrations).
              'header_saveload',
              'header_fullscreen_button',
              'header_compare',
              'header_symbol_search',
              'header_quick_search',
              'header_undo_redo',
              'symbol_search_hot_key',
              'allow_arbitrary_symbol_search_input',
              'show_interval_dialog_on_key_press',
              'popup_hints',
              'right_bar_stays_on_scroll',
              'symbol_info',
              'display_market_status',
            ] as ChartingLibraryFeatureset[])
          : []),
      ],
      enabled_features: [
        'iframe_loading_same_origin' as ChartingLibraryFeatureset,
        // Hide the left drawing toolbar on initial load (user can still toggle it back on).
        'hide_left_toolbar_by_default' as ChartingLibraryFeatureset,
      ],
      load_last_chart: false,
      theme: 'Dark',
      fullscreen: false,
      autosize: true,
      studies_overrides: {},
      overrides: {
        ...lavaOverrides,
      },
    };

    const widget = new window.TradingView.widget(widgetOptions);

    widget.onChartReady(() => {
      // Force-apply overrides after the chart is initialized (helps when defaults/local settings win on first paint).
      widget.applyOverrides(lavaOverrides);

      const compactMq = window.matchMedia('(max-width: 640px)');
      const coarseMq = window.matchMedia('(pointer: coarse)');

      const setBarSpacingSafely = (barSpacing: number) => {
        try {
          // TradingView Charting Library API:
          // widget.activeChart().getTimeScale().setBarSpacing(number)
          (widget as unknown as any)?.activeChart?.()?.getTimeScale?.()?.setBarSpacing?.(barSpacing);
        } catch {
          // noop
        }
      };

      const applyResponsiveDensity = () => {
        const dpr = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;
        const isCompact = compactMq.matches || coarseMq.matches;

        const mobileScaleFontSize = dpr >= 3 ? 8 : dpr >= 2 ? 9 : 10;

        // `barSpacing` is pixel-based; keep the chart feeling "zoomed out" on high-DPR phones.
        const mobileBarSpacing = dpr >= 3 ? 2 : 3;

        if (isCompact) {
          widget.applyOverrides({
            ...lavaOverrides,
            ...mobileOverridesBase,
            'scalesProperties.fontSize': mobileScaleFontSize,
          });
          // Default is ~6; smaller = more candles visible ("zoomed out").
          setBarSpacingSafely(mobileBarSpacing);
        } else {
          widget.applyOverrides(lavaOverrides);
          setBarSpacingSafely(6);
        }
      };

      // Ensure the main pane is auto-scaled (helps when mobile layouts look "too zoomed").
      try {
        (widget as unknown as any)
          ?.activeChart?.()
          ?.getPanes?.()
          ?.at?.(0)
          ?.getMainSourcePriceScale?.()
          ?.setAutoScale?.(true);
      } catch {
        // noop
      }

      applyResponsiveDensity();
      compactMq.addEventListener?.('change', applyResponsiveDensity);
      coarseMq.addEventListener?.('change', applyResponsiveDensity);
      window.addEventListener('resize', applyResponsiveDensity);

      // Hide the right sidebar by default.
      // Note: this API is Trading Platform/Advanced Charts specific; if unavailable it will reject safely.
      widget
        .widgetbar()
        .then((widgetbar) => widgetbar.changeWidgetBarVisibility(false))
        .catch(() => {});

      widgetRef.current = widget;

      // Clean up the media query listener when the widget is removed.
      // (TradingView doesn't own the listener lifecycle.)
      const removeListener = () => {
        compactMq.removeEventListener?.('change', applyResponsiveDensity);
        coarseMq.removeEventListener?.('change', applyResponsiveDensity);
        window.removeEventListener('resize', applyResponsiveDensity);
      };
      (widgetRef.current as unknown as any).__sbRemoveMqListener = removeListener;
    });

    return () => {
      if (widgetRef.current) {
        try {
          (widgetRef.current as unknown as any).__sbRemoveMqListener?.();
        } catch {
          // noop
        }
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
