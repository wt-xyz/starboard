import React, { createContext, ReactNode, useContext } from 'react';

import { PerpetualMarketSummary, SubaccountPosition } from '@/bonsai/types/summaryTypes';
import { mockMarketSummaries } from '@/mockData/positionsMockData';

import { PositionProcessorProvider, useProcessorPositions } from './PositionProcessorProvider';

interface MockDataContextType {
  positions: SubaccountPosition[];
  marketSummaries: Record<string, PerpetualMarketSummary>;
  isMockMode: boolean;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

interface MockDataProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export const MockDataProvider: React.FC<MockDataProviderProps> = ({ children, enabled = true }) => {
  return (
    <PositionProcessorProvider enabled={enabled}>
      <MockDataProviderInner enabled={enabled}>{children}</MockDataProviderInner>
    </PositionProcessorProvider>
  );
};

const MockDataProviderInner: React.FC<MockDataProviderProps> = ({ children, enabled = true }) => {
  const processorPositions = useProcessorPositions();

  const contextValue: MockDataContextType = {
    positions: enabled ? processorPositions : [],
    marketSummaries: enabled ? mockMarketSummaries : {},
    isMockMode: enabled,
  };

  return <MockDataContext.Provider value={contextValue}>{children}</MockDataContext.Provider>;
};

export const useMockData = (): MockDataContextType => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
};

// Hook to get mock positions with filtering logic similar to the real implementation
export const useMockPositions = (currentMarket?: string, marketTypeFilter?: string) => {
  const { positions, isMockMode } = useMockData();

  if (!isMockMode) {
    return [];
  }

  return positions.filter((position) => {
    const matchesMarket = currentMarket == null || position.market === currentMarket;
    const marginType = position.marginMode;

    // Simple market type filtering logic
    let matchesType = true;
    if (marketTypeFilter === 'ISOLATED') {
      matchesType = marginType === 'ISOLATED';
    } else if (marketTypeFilter === 'CROSS') {
      matchesType = marginType === 'CROSS';
    }

    return matchesMarket && matchesType;
  });
};

// Hook to get mock market summaries
export const useMockMarketSummaries = () => {
  const { marketSummaries, isMockMode } = useMockData();
  return isMockMode ? marketSummaries : {};
};
