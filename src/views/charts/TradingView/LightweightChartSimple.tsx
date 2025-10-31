import { ResolutionString } from 'public/tradingview/charting_library';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { DEFAULT_MARKETID } from '@/constants/markets';
import { useSimpleUiEnabled } from '@/hooks/useSimpleUiEnabled';

import { useAppSelector } from '@/state/appTypes';
import { getCurrentMarketId } from '@/state/currentMarketSelectors';

import { LightweightChart } from '@/components/LightweightChart';
import { ResolutionSelector } from './ResolutionSelector';

import { layoutMixins } from '@/styles/layoutMixins';

export const LightweightChartSimple = () => {
  const currentMarketId: string = useAppSelector(getCurrentMarketId) ?? DEFAULT_MARKETID;
  const isSimpleUi = useSimpleUiEnabled();
  const [currentResolution, setCurrentResolution] = useState<ResolutionString>('1D' as ResolutionString);

  const onResolutionChange = useCallback((resolution: ResolutionString) => {
    setCurrentResolution(resolution);
  }, []);

  if (isSimpleUi) {
    return (
      <div tw="flexColumn h-full">
        <$ChartContainer>
          <LightweightChart
            symbol={currentMarketId}
            width="100%"
            height="100%"
          />
        </$ChartContainer>
        
        <ResolutionSelector
          isLaunchable={false}
          onResolutionChange={onResolutionChange}
          currentResolution={currentResolution}
        />
      </div>
    );
  }

  return (
    <$ChartContainer>
      <LightweightChart
        symbol={currentMarketId}
        width="100%"
        height="100%"
      />
    </$ChartContainer>
  );
};

const $ChartContainer = styled.div`
  ${layoutMixins.stack}
  user-select: none;
  height: 100%;
  width: 100%;
  
  /* Match the original chart styling */
  > div {
    height: 100%;
    width: 100%;
  }
`;

