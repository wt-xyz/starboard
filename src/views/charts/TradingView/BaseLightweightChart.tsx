import { useCallback, useState } from 'react';

import { ResolutionString } from 'public/tradingview/charting_library';
import styled, { css } from 'styled-components';

import { layoutMixins } from '@/styles/layoutMixins';

import { LightweightChart } from '@/components/LightweightChart';
import { LoadingSpace } from '@/components/Loading/LoadingSpinner';

import { ResolutionSelector } from './ResolutionSelector';

export const BaseLightweightChart = ({
  symbol,
  isLaunchable,
  isSimpleUi,
}: {
  symbol: string;
  isLaunchable?: boolean;
  isSimpleUi?: boolean;
}) => {
  const [isChartReady, setIsChartReady] = useState(false);
  const DEFAULT_RESOLUTION = '1D' as ResolutionString;
  const [currentResolution, setCurrentResolution] = useState<ResolutionString>(DEFAULT_RESOLUTION);

  const onResolutionChange = useCallback((resolution: ResolutionString) => {
    setCurrentResolution(resolution);
  }, []);

  const handleChartReady = useCallback(() => {
    setIsChartReady(true);
  }, []);

  if (isSimpleUi) {
    return (
      <div tw="flexColumn h-full">
        <$PriceChart isChartReady={isChartReady}>
          {!isChartReady && <LoadingSpace id="lw-chart-loading" />}

          <LightweightChart
            symbol={symbol}
            width="100%"
            height="100%"
            onChartReady={handleChartReady}
          />
        </$PriceChart>

        {isChartReady && (
          <ResolutionSelector
            isLaunchable={isLaunchable}
            onResolutionChange={onResolutionChange}
            currentResolution={currentResolution}
          />
        )}
      </div>
    );
  }

  return (
    <$PriceChart isChartReady={isChartReady}>
      {!isChartReady && <LoadingSpace id="lw-chart-loading" />}

      <LightweightChart
        symbol={symbol}
        width="100%"
        height="100%"
        onChartReady={handleChartReady}
      />
    </$PriceChart>
  );
};

const $PriceChart = styled.div<{ isChartReady?: boolean }>`
  ${layoutMixins.stack}
  user-select: none;

  height: 100%;

  > div {
    ${({ isChartReady }) =>
      !isChartReady &&
      css`
        filter: blur(3px);
        translate: 0 0 1rem;
        opacity: 0;
      `};

    @media (prefers-reduced-motion: no-preference) {
      transition: 0.2s var(--ease-out-expo);
    }
  }
`;

