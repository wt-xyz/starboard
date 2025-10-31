
import { USE_WIDGET_CHARTS } from '@/constants/chartConfig';

import { LightweightChartSimple } from './LightweightChartSimple';
import { TvChart } from './TvChart';

/**
 * ChartSelector component that automatically chooses between:
 * - Original charting library (TvChart) when USE_WIDGET_CHARTS is false
 * - Lightweight Charts (LightweightChartSimple) when USE_WIDGET_CHARTS is true
 */
export const ChartSelector = () => {
  if (USE_WIDGET_CHARTS) {
    return <LightweightChartSimple />;
  }

  return <TvChart />;
};
