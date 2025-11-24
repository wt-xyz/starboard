import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setAllMarketsRaw } from '@/state/raw';

import { useOraclePricePolling } from '../oraclePricePolling';

// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

const mockUseQuery = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: (args: any) => mockUseQuery(args),
}));

const mockUseAppSelector = vi.fn();
const mockDispatch = vi.fn();
vi.mock('@/state/appTypes', () => ({
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
  useAppDispatch: () => mockDispatch,
}));

const mockIndexerClient = {
  markets: {
    getPerpetualMarkets: vi.fn(),
  },
};
vi.mock('@/bonsai/rest/lib/useIndexer', () => ({
  useCompositeClientManager: () => ({
    indexer: {
      client: mockIndexerClient,
    },
  }),
}));

vi.mock('@/bonsai/socketSelectors', () => ({
  selectIndexerClientKey: 'mock-indexer-key',
  selectWebsocketUrl: 'mock-ws-selector',
}));

let mockWebsocketEnabled = false;
vi.mock('@/bonsai/websocket/markets', () => ({
  get MARKETS_WEBSOCKET_ENABLED() {
    return mockWebsocketEnabled;
  },
}));

vi.mock('@/bonsai/lib/loadable', () => ({
  loadableLoaded: (data: any) => ({ status: 'loaded', data }),
}));
vi.mock('@/bonsai/lib/marketUtils', () => ({
  transformMarkets: (markets: any) => markets,
}));
vi.mock('@/bonsai/logs', () => ({
  wrapAndLogBonsaiError: (fn: any) => fn,
}));
vi.mock('@/state/raw', () => ({
  setAllMarketsRaw: vi.fn().mockReturnValue('mock-action'),
}));
vi.mock('@/constants/time', () => ({
  timeUnits: { second: 1000 },
}));

const TestComponent = () => {
  useOraclePricePolling();
  return null;
};

describe('useOraclePricePolling', () => {
  let container: HTMLDivElement;
  let root: any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: null });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('should enable polling when WebSocket URL is missing', () => {
    mockWebsocketEnabled = true;
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === 'mock-ws-selector') return undefined;
      if (selector === 'mock-indexer-key') return 'key';
      return undefined;
    });

    act(() => {
      root.render(<TestComponent />);
    });

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        refetchInterval: 10000,
      })
    );
  });

  it('should enable polling when WebSocket is explicitly disabled', () => {
    mockWebsocketEnabled = false;
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === 'mock-ws-selector') return 'ws://test.url';
      if (selector === 'mock-indexer-key') return 'key';
      return undefined;
    });

    act(() => {
      root.render(<TestComponent />);
    });

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        refetchInterval: 10000,
      })
    );
  });

  it('should disable polling when WebSocket is available and enabled', () => {
    mockWebsocketEnabled = true;
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === 'mock-ws-selector') return 'ws://test.url';
      if (selector === 'mock-indexer-key') return 'key';
      return undefined;
    });

    act(() => {
      root.render(<TestComponent />);
    });

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('should dispatch setAllMarketsRaw when data is received', () => {
    mockWebsocketEnabled = false;
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector === 'mock-ws-selector') return 'ws://test.url';
      return undefined;
    });

    const mockData = { markets: { 'BTC-USD': { oraclePrice: '100' } } };
    mockUseQuery.mockReturnValue({ data: mockData });

    act(() => {
      root.render(<TestComponent />);
    });

    expect(mockDispatch).toHaveBeenCalledWith('mock-action');
    expect(setAllMarketsRaw).toHaveBeenCalledWith({
      status: 'loaded',
      data: mockData.markets,
    });
  });
});
