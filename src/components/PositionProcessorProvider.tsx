import { SubaccountPosition } from '@/bonsai/types/summaryTypes';
import { convertSDKPositionsToSubaccountPositions } from '@/lib/positionConversion';
import { MOCK_ADDRESS, MOCK_SUBACCOUNT_NUMBER, mockPositionUpdates } from '@/mockData/positionUpdatesMockData';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { PositionAnalytics, PositionEvent, PositionEventProcessor, PositionEventProcessorConfig } from 'starboard-client-js';

interface PositionProcessorContextType {
  positions: SubaccountPosition[];
  processor: PositionEventProcessor;
  isMockMode: boolean;
  events: PositionEvent[];
  analytics: PositionAnalytics[];
}

const PositionProcessorContext = createContext<PositionProcessorContextType | null>(null);

interface PositionProcessorProviderProps {
  children: ReactNode;
  enabled?: boolean;
  config?: PositionEventProcessorConfig;
}

export const PositionProcessorProvider: React.FC<PositionProcessorProviderProps> = ({ 
  children, 
  enabled = true,
  config = {}
}) => {
  const [processor] = useState(() => new PositionEventProcessor({
    enableAnalytics: true,
    debug: true,
    ...config,
  }));
  
  const [positions, setPositions] = useState<SubaccountPosition[]>([]);
  const [events, setEvents] = useState<PositionEvent[]>([]);
  const [analytics, setAnalytics] = useState<PositionAnalytics[]>([]);

  // Initialize mock data when enabled
  useEffect(() => {
    if (enabled) {
      // Clear existing data
      processor.clear();
      setPositions([]);
      setEvents([]);
      setAnalytics([]);

      // Process mock position updates
      const processedEvents = processor.processPositionUpdates(
        mockPositionUpdates,
        MOCK_ADDRESS,
        MOCK_SUBACCOUNT_NUMBER,
        '12345680'
      );

      // Convert SDK positions to SubaccountPosition format
      const sdkPositions = processor.getAllOpenPositions();
      const convertedPositions = convertSDKPositionsToSubaccountPositions(
        sdkPositions,
        MOCK_ADDRESS,
        MOCK_SUBACCOUNT_NUMBER
      );

      setPositions(convertedPositions);
      setEvents(processedEvents);
    }
  }, [enabled, processor]);

  // Set up event listeners
  useEffect(() => {
    const handlePositionEvent = (event: PositionEvent) => {
      setEvents(prev => [...prev, event]);
      
      // Update positions when events occur
      const sdkPositions = processor.getAllOpenPositions();
      const convertedPositions = convertSDKPositionsToSubaccountPositions(
        sdkPositions,
        MOCK_ADDRESS,
        MOCK_SUBACCOUNT_NUMBER
      );
      setPositions(convertedPositions);
    };

    const handleAnalytics = (analyticsData: PositionAnalytics) => {
      setAnalytics(prev => [...prev, analyticsData]);
    };

    processor.on('position_event', handlePositionEvent);
    processor.on('position_analytics', handleAnalytics);

    return () => {
      processor.off('position_event', handlePositionEvent);
      processor.off('position_analytics', handleAnalytics);
    };
  }, [processor]);

  const contextValue: PositionProcessorContextType = {
    positions,
    processor,
    isMockMode: enabled,
    events,
    analytics,
  };

  return (
    <PositionProcessorContext.Provider value={contextValue}>
      {children}
    </PositionProcessorContext.Provider>
  );
};

export const usePositionProcessor = (): PositionProcessorContextType => {
  const context = useContext(PositionProcessorContext);
  if (!context) {
    throw new Error('usePositionProcessor must be used within a PositionProcessorProvider');
  }
  return context;
};

// Hook to get positions with filtering logic
export const useProcessorPositions = (
  currentMarket?: string,
  marketTypeFilter?: string
) => {
  const { positions, isMockMode } = usePositionProcessor();
  
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

// Hook to get all events
export const usePositionEvents = () => {
  const { events, isMockMode } = usePositionProcessor();
  return isMockMode ? events : [];
};

// Hook to get analytics
export const usePositionAnalytics = () => {
  const { analytics, isMockMode } = usePositionProcessor();
  return isMockMode ? analytics : [];
};
