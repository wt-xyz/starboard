import type { ThemePreference } from '@/contexts/ThemeContext/ThemeContext';

export interface TradingViewColors {
  cardBg: string;
  primary: string;
  pageBg: string;
  surfaceHover: string;
  textPrimary: string;
  borderDefault: string;
  separatorColor: string;
  highlightColor: string;
  candleUp: string;
  candleDown: string;
  tvTheme: 'Dark' | 'Light';
}

const dark: TradingViewColors = {
  cardBg: '#1B1B1E',
  primary: '#F56E0F',
  pageBg: '#151419',
  surfaceHover: '#262626',
  textPrimary: '#FBFBFB',
  borderDefault: 'rgba(251, 251, 251, 0.1)',
  separatorColor: 'rgba(21, 20, 25, 0.2)',
  highlightColor: 'rgba(245, 110, 15, 0.15)',
  candleUp: '#22c55e',
  candleDown: '#ef4444',
  tvTheme: 'Dark',
};

const light: TradingViewColors = {
  cardBg: '#FCFCFD',
  primary: '#F56E0F',
  pageBg: '#F0EFF4',
  surfaceHover: '#E3E3E3',
  textPrimary: '#1A1A1A',
  borderDefault: 'rgba(0, 0, 0, 0.08)',
  separatorColor: 'rgba(0, 0, 0, 0.06)',
  highlightColor: 'rgba(245, 110, 15, 0.12)',
  candleUp: '#16a34a',
  candleDown: '#dc2626',
  tvTheme: 'Light',
};

export const tradingViewThemes: Record<ThemePreference, TradingViewColors> = {
  dark,
  light,
};

export function createTradingViewCustomCssUrl(tv: TradingViewColors): string {
  const css = `
@import url("/tradingview/custom-styles.css");

/* Starboard: match dashboard panel grey for the Object Tree panel container. */
.wrap-ukH4sVzT,
.wrap-ukH4sVzT .space-ukH4sVzT,
.wrap-ukH4sVzT .tree-ukH4sVzT {
  background-color: ${tv.cardBg} !important;
}

/* Starboard: remove blue selection highlight in the Object Tree list. */
.wrap-IEe5qpW4,
html.theme-dark .wrap-IEe5qpW4,
html.theme-light .wrap-IEe5qpW4 {
  background-color: ${tv.cardBg} !important;
}

@media (any-hover:hover) {
  .wrap-IEe5qpW4:hover,
  html.theme-dark .wrap-IEe5qpW4:hover,
  html.theme-light .wrap-IEe5qpW4:hover {
    background-color: ${tv.surfaceHover} !important;
  }
}

.wrap-IEe5qpW4.selected-IEe5qpW4,
html.theme-dark .wrap-IEe5qpW4.selected-IEe5qpW4,
html.theme-light .wrap-IEe5qpW4.selected-IEe5qpW4,
.wrap-IEe5qpW4.childOfSelected-IEe5qpW4,
html.theme-dark .wrap-IEe5qpW4.childOfSelected-IEe5qpW4,
html.theme-light .wrap-IEe5qpW4.childOfSelected-IEe5qpW4 {
  background-color: ${tv.surfaceHover} !important;
}

@media (any-hover:hover) {
  .wrap-IEe5qpW4.selected-IEe5qpW4:hover,
  html.theme-dark .wrap-IEe5qpW4.selected-IEe5qpW4:hover,
  html.theme-light .wrap-IEe5qpW4.selected-IEe5qpW4:hover,
  .wrap-IEe5qpW4.childOfSelected-IEe5qpW4:hover,
  html.theme-dark .wrap-IEe5qpW4.childOfSelected-IEe5qpW4:hover,
  html.theme-light .wrap-IEe5qpW4.childOfSelected-IEe5qpW4:hover {
    background-color: ${tv.surfaceHover} !important;
  }
}

/* Starboard: use Liquid Lava as TradingView active accent. */
:root, html, body {
  --color-accent: ${tv.primary} !important;
  --tv-color-platform-background: ${tv.cardBg} !important;
  --tv-color-pane-background: ${tv.cardBg} !important;
  --tv-color-toolbar-button-background-active: ${tv.primary} !important;
  --tv-color-toolbar-button-background-active-hover: ${tv.primary} !important;
  --tv-color-toolbar-button-text-active: ${tv.textPrimary} !important;
  --tv-color-toolbar-button-text-active-hover: ${tv.textPrimary} !important;
  --tv-color-popup-element-background-active: ${tv.primary} !important;
  --tv-color-popup-element-toolbox-background-active-hover: ${tv.primary} !important;
  --tv-color-item-active-text: ${tv.textPrimary} !important;
}

/* Remove left padding/margin from chart */
.chart-markup-table {
  margin-left: 0 !important;
  padding-left: 0 !important;
}
.layout__area--left {
  display: none !important;
}

/* Ensure time scale (X-axis) is fully visible */
.chart-container {
  padding-bottom: 2px !important;
}
.time-axis {
  overflow: visible !important;
}

/* Mobile: ensure X-axis labels are fully visible */
@media (max-width: 1024px) {
  .chart-container {
    padding-bottom: 6px !important;
  }
  .chart-widget {
    margin-bottom: 4px !important;
  }
}
`;

  return URL.createObjectURL(new Blob([css], { type: 'text/css' }));
}
