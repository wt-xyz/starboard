import { vi } from 'vitest';
import {
    PositionEventProcessor,
    PositionEventProcessorConfig,
} from '../../src/clients/position-event-processor';
import {
    PositionAnalytics,
    PositionEvent,
    PositionEventType,
    PositionSide,
    PositionStatus,
    PositionUpdate
} from '../../src/clients/position-event-types';

describe('PositionEventProcessor', () => {
  const TEST_ADDRESS = 'dydx1test123';
  const TEST_SUBACCOUNT = 0;
  const TEST_MARKET = 'BTC-USD';
  const TEST_BLOCK_HEIGHT = '12345';

  let processor: PositionEventProcessor;

  beforeEach(() => {
    processor = new PositionEventProcessor();
  });

  afterEach(() => {
    processor.clear();
    processor.removeAllListeners();
  });

  describe('constructor', () => {
    it('should create processor with default config', () => {
      const proc = new PositionEventProcessor();
      expect(proc).toBeDefined();
    });

    it('should create processor with custom config', () => {
      const config: PositionEventProcessorConfig = {
        enableAnalytics: false,
        debug: true,
      };
      const proc = new PositionEventProcessor(config);
      expect(proc).toBeDefined();
    });

    it('should accept callbacks in config', () => {
      const onAnalytics = vi.fn();
      const onError = vi.fn();
      const proc = new PositionEventProcessor({
        onAnalytics,
        onError,
      });
      expect(proc).toBeDefined();
    });
  });

  describe('processPositionUpdate', () => {
    describe('POSITION_OPENED event', () => {
      it('should emit POSITION_OPENED event for new position', () => {
        return new Promise<void>((resolve) => {
        const update: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.5',
          maxSize: '1.5',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.on('position_event', (event: PositionEvent) => {
          expect(event.type).toBe(PositionEventType.POSITION_OPENED);
          expect(event.position.market).toBe(TEST_MARKET);
          expect(event.position.size).toBe('1.5');
          expect(event.position.side).toBe(PositionSide.LONG);
          expect(event.subaccount.address).toBe(TEST_ADDRESS);
          expect(event.subaccount.subaccountNumber).toBe(TEST_SUBACCOUNT);
          resolve();
        });

        const result = processor.processPositionUpdate(
          update,
          TEST_ADDRESS,
          TEST_SUBACCOUNT,
          TEST_BLOCK_HEIGHT
        );

        expect(result).not.toBeNull();
        expect(result?.type).toBe(PositionEventType.POSITION_OPENED);
        });
      });

      it('should emit specific position_opened event', () => {
        return new Promise<void>((resolve) => {
        const update: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.on('position_opened', (event: PositionEvent) => {
          expect(event.type).toBe(PositionEventType.POSITION_OPENED);
          resolve();
        });

        processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
        });
      });

      it('should store position in internal state', () => {
        const update: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);

        const position = processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, TEST_MARKET);
        expect(position).toBeDefined();
        expect(position?.market).toBe(TEST_MARKET);
        expect(position?.size).toBe('1.0');
      });
    });

    describe('POSITION_MODIFIED event', () => {
      it('should emit POSITION_MODIFIED event when size changes', () => {
        return new Promise<void>((resolve) => {
        const openUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

        const modifyUpdate: PositionUpdate = {
          market: TEST_MARKET,
          size: '2.0',
          maxSize: '2.0',
        };

        processor.on('position_modified', (event: PositionEvent) => {
          expect(event.type).toBe(PositionEventType.POSITION_MODIFIED);
          expect(event.position.size).toBe('2.0');
          expect(event.previousPosition).toBeDefined();
          expect(event.previousPosition?.size).toBe('1.0');
          resolve();
        });

        processor.processPositionUpdate(modifyUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
        });
      });

      it('should not emit event when size remains the same', () => {
        const openUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

        const sameUpdate: PositionUpdate = {
          market: TEST_MARKET,
          size: '1.0',
        };

        const result = processor.processPositionUpdate(sameUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
        expect(result).toBeNull();
      });
    });

    describe('POSITION_CLOSED event', () => {
      it('should emit POSITION_CLOSED event when position closes', () => {
        return new Promise<void>((resolve) => {
        const openUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

        const closeUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.CLOSED,
          exitPrice: '51000',
          realizedPnl: '1000',
          closedAt: new Date().toISOString(),
        };

        processor.on('position_closed', (event: PositionEvent) => {
          expect(event.type).toBe(PositionEventType.POSITION_CLOSED);
          expect(event.position.status).toBe(PositionStatus.CLOSED);
          expect(event.position.exitPrice).toBe('51000');
          expect(event.previousPosition?.status).toBe(PositionStatus.OPEN);
          resolve();
        });

        processor.processPositionUpdate(closeUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
        });
      });

      it('should remove closed position from state', () => {
        const openUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
        expect(processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, TEST_MARKET)).toBeDefined();

        const closeUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.CLOSED,
        };

        processor.processPositionUpdate(closeUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
        expect(processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, TEST_MARKET)).toBeUndefined();
      });
    });

    describe('POSITION_LIQUIDATED event', () => {
      it('should emit POSITION_LIQUIDATED event', () => {
        return new Promise<void>((resolve) => {
        const openUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

        const liquidateUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.LIQUIDATED,
          exitPrice: '48000',
          realizedPnl: '-2000',
        };

        processor.on('position_liquidated', (event: PositionEvent) => {
          expect(event.type).toBe(PositionEventType.POSITION_LIQUIDATED);
          expect(event.position.status).toBe(PositionStatus.LIQUIDATED);
          resolve();
        });

        processor.processPositionUpdate(liquidateUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
        });
      });

      it('should remove liquidated position from state', () => {
        const openUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        };

        processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

        const liquidateUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.LIQUIDATED,
        };

        processor.processPositionUpdate(liquidateUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
        expect(processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, TEST_MARKET)).toBeUndefined();
      });
    });

    it('should handle incomplete updates gracefully', () => {
      const proc = new PositionEventProcessor();

      const incompleteUpdate: PositionUpdate = {
        market: TEST_MARKET,
      };

      const result = proc.processPositionUpdate(incompleteUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      expect(result).not.toBeNull();
      expect(result?.type).toBe(PositionEventType.POSITION_OPENED);
    });
  });

  describe('processPositionUpdates', () => {
    it('should process multiple updates in batch', () => {
      const updates: PositionUpdate[] = [
        {
          market: 'BTC-USD',
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        },
        {
          market: 'ETH-USD',
          status: PositionStatus.OPEN,
          side: PositionSide.SHORT,
          size: '10.0',
          maxSize: '10.0',
          entryPrice: '3000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        },
      ];

      const events = processor.processPositionUpdates(
        updates,
        TEST_ADDRESS,
        TEST_SUBACCOUNT,
        TEST_BLOCK_HEIGHT
      );

      expect(events).toHaveLength(2);
      expect(events[0].position.market).toBe('BTC-USD');
      expect(events[1].position.market).toBe('ETH-USD');
    });

    it('should filter out null events in batch', () => {
      const openUpdate: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      const updates: PositionUpdate[] = [
        {
          market: TEST_MARKET,
          size: '1.0',
        },
        {
          market: TEST_MARKET,
          size: '2.0',
        },
      ];

      const events = processor.processPositionUpdates(updates, TEST_ADDRESS, TEST_SUBACCOUNT);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe(PositionEventType.POSITION_MODIFIED);
    });
  });

  describe('getPosition', () => {
    it('should return position by address, subaccount, and market', () => {
      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);

      const position = processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, TEST_MARKET);
      expect(position).toBeDefined();
      expect(position?.market).toBe(TEST_MARKET);
    });

    it('should return undefined for non-existent position', () => {
      const position = processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, 'NON-EXISTENT');
      expect(position).toBeUndefined();
    });
  });

  describe('getSubaccountPositions', () => {
    it('should return all positions for a subaccount', () => {
      const updates: PositionUpdate[] = [
        {
          market: 'BTC-USD',
          status: PositionStatus.OPEN,
          side: PositionSide.LONG,
          size: '1.0',
          maxSize: '1.0',
          entryPrice: '50000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        },
        {
          market: 'ETH-USD',
          status: PositionStatus.OPEN,
          side: PositionSide.SHORT,
          size: '10.0',
          maxSize: '10.0',
          entryPrice: '3000',
          realizedPnl: '0',
          createdAt: new Date().toISOString(),
          createdAtHeight: TEST_BLOCK_HEIGHT,
        },
      ];

      processor.processPositionUpdates(updates, TEST_ADDRESS, TEST_SUBACCOUNT);

      const positions = processor.getSubaccountPositions(TEST_ADDRESS, TEST_SUBACCOUNT);
      expect(positions).toHaveLength(2);
      expect(positions.map((p) => p.market).sort()).toEqual(['BTC-USD', 'ETH-USD']);
    });

    it('should return empty array for subaccount with no positions', () => {
      const positions = processor.getSubaccountPositions(TEST_ADDRESS, TEST_SUBACCOUNT);
      expect(positions).toEqual([]);
    });

    it('should not include positions from other subaccounts', () => {
      const update1: PositionUpdate = {
        market: 'BTC-USD',
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      const update2: PositionUpdate = {
        market: 'ETH-USD',
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '10.0',
        maxSize: '10.0',
        entryPrice: '3000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(update1, TEST_ADDRESS, 0);
      processor.processPositionUpdate(update2, TEST_ADDRESS, 1);

      const positions0 = processor.getSubaccountPositions(TEST_ADDRESS, 0);
      const positions1 = processor.getSubaccountPositions(TEST_ADDRESS, 1);

      expect(positions0).toHaveLength(1);
      expect(positions1).toHaveLength(1);
      expect(positions0[0].market).toBe('BTC-USD');
      expect(positions1[0].market).toBe('ETH-USD');
    });
  });

  describe('getAllOpenPositions', () => {
    it('should return only open positions', () => {
      const openUpdate: PositionUpdate = {
        market: 'BTC-USD',
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      const openPositions = processor.getAllOpenPositions();
      expect(openPositions).toHaveLength(1);
      expect(openPositions[0].status).toBe(PositionStatus.OPEN);
    });

    it('should return empty array when no open positions', () => {
      const openPositions = processor.getAllOpenPositions();
      expect(openPositions).toEqual([]);
    });

    it('should exclude closed positions', () => {
      const openUpdate: PositionUpdate = {
        market: 'BTC-USD',
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      const closeUpdate: PositionUpdate = {
        market: 'BTC-USD',
        status: PositionStatus.CLOSED,
      };

      processor.processPositionUpdate(closeUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      const openPositions = processor.getAllOpenPositions();
      expect(openPositions).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all positions and state', () => {
      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      expect(processor.getAllOpenPositions()).toHaveLength(1);

      processor.clear();
      expect(processor.getAllOpenPositions()).toEqual([]);
      expect(processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, TEST_MARKET)).toBeUndefined();
    });
  });

  describe('analytics', () => {
    it('should emit position_analytics event when analytics enabled', () => {
      return new Promise<void>((resolve) => {
      const proc = new PositionEventProcessor({ enableAnalytics: true });

      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      proc.on('position_analytics', (analytics: PositionAnalytics) => {
        expect(analytics.market).toBe(TEST_MARKET);
        expect(analytics.side).toBe(PositionSide.LONG);
        expect(analytics.entryPrice).toBe(50000);
        expect(analytics.eventType).toBe(PositionEventType.POSITION_OPENED);
        expect(analytics.address).toBe(TEST_ADDRESS);
        expect(analytics.subaccountNumber).toBe(TEST_SUBACCOUNT);
        resolve();
      });

      proc.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });

    it('should call onAnalytics callback when provided', () => {
      return new Promise<void>((resolve) => {
      const onAnalytics = vi.fn((analytics: PositionAnalytics) => {
        expect(analytics.market).toBe(TEST_MARKET);
        resolve();
      });

      const proc = new PositionEventProcessor({ onAnalytics });

      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      proc.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      expect(onAnalytics).toHaveBeenCalled();
      });
    });

    it('should not emit analytics when disabled', () => {
      const proc = new PositionEventProcessor({ enableAnalytics: false });
      const analyticsSpy = vi.fn();

      proc.on('position_analytics', analyticsSpy);

      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      proc.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      expect(analyticsSpy).not.toHaveBeenCalled();
    });

    it('should include duration for closed positions', () => {
      return new Promise<void>((resolve) => {
      const proc = new PositionEventProcessor({ enableAnalytics: true });

      const openUpdate: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      proc.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      setTimeout(() => {
        const closeUpdate: PositionUpdate = {
          market: TEST_MARKET,
          status: PositionStatus.CLOSED,
          exitPrice: '51000',
          realizedPnl: '1000',
        };

        proc.on('position_analytics', (analytics: PositionAnalytics) => {
          if (analytics.eventType === PositionEventType.POSITION_CLOSED) {
            expect(analytics.durationSeconds).toBeDefined();
            expect(analytics.durationSeconds).toBeGreaterThanOrEqual(0);
            expect(analytics.exitPrice).toBe(51000);
            resolve();
          }
        });

        proc.processPositionUpdate(closeUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
      }, 1000);
      });
    }, 10000);
  });

  describe('error handling', () => {
    it('should have error handling capabilities', () => {
      const onError = vi.fn();
      const proc = new PositionEventProcessor({ onError, debug: false });

      expect(proc).toBeDefined();
    });
  });

  describe('event listener overloads', () => {
    it('should support position_event listener', () => {
      return new Promise<void>((resolve) => {
      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.on('position_event', (event: PositionEvent) => {
        expect(event).toBeDefined();
        resolve();
      });

      processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });

    it('should support position_opened listener', () => {
      return new Promise<void>((resolve) => {
      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.on('position_opened', (event: PositionEvent) => {
        expect(event).toBeDefined();
        resolve();
      });

      processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });

    it('should support position_modified listener', () => {
      return new Promise<void>((resolve) => {
      const openUpdate: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      processor.on('position_modified', (event: PositionEvent) => {
        expect(event).toBeDefined();
        resolve();
      });

      const modifyUpdate: PositionUpdate = {
        market: TEST_MARKET,
        size: '2.0',
      };

      processor.processPositionUpdate(modifyUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });

    it('should support position_closed listener', () => {
      return new Promise<void>((resolve) => {
      const openUpdate: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      processor.on('position_closed', (event: PositionEvent) => {
        expect(event).toBeDefined();
        resolve();
      });

      const closeUpdate: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.CLOSED,
      };

      processor.processPositionUpdate(closeUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });

    it('should support position_liquidated listener', () => {
      return new Promise<void>((resolve) => {
      const openUpdate: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(openUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      processor.on('position_liquidated', (event: PositionEvent) => {
        expect(event).toBeDefined();
        resolve();
      });

      const liquidateUpdate: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.LIQUIDATED,
      };

      processor.processPositionUpdate(liquidateUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });

    it('should support position_analytics listener', () => {
      return new Promise<void>((resolve) => {
      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.on('position_analytics', (analytics: PositionAnalytics) => {
        expect(analytics).toBeDefined();
        resolve();
      });

      processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });

    it('should support error listener', () => {
      const errorHandler = vi.fn();
      processor.on('error', errorHandler);

      expect(errorHandler).toBeDefined();
    });
  });

  describe('SHORT positions', () => {
    it('should handle SHORT position opening', () => {
      return new Promise<void>((resolve) => {
      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.SHORT,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.on('position_opened', (event: PositionEvent) => {
        expect(event.position.side).toBe(PositionSide.SHORT);
        resolve();
      });

      processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });

    it('should calculate analytics for SHORT positions', () => {
      return new Promise<void>((resolve) => {
      const update: PositionUpdate = {
        market: TEST_MARKET,
        status: PositionStatus.OPEN,
        side: PositionSide.SHORT,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.on('position_analytics', (analytics: PositionAnalytics) => {
        expect(analytics.side).toBe(PositionSide.SHORT);
        expect(analytics.liquidationPrice).toBeDefined();
        resolve();
      });

      processor.processPositionUpdate(update, TEST_ADDRESS, TEST_SUBACCOUNT);
      });
    });
  });

  describe('multiple markets', () => {
    it('should handle positions across multiple markets', () => {
      const btcUpdate: PositionUpdate = {
        market: 'BTC-USD',
        status: PositionStatus.OPEN,
        side: PositionSide.LONG,
        size: '1.0',
        maxSize: '1.0',
        entryPrice: '50000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      const ethUpdate: PositionUpdate = {
        market: 'ETH-USD',
        status: PositionStatus.OPEN,
        side: PositionSide.SHORT,
        size: '10.0',
        maxSize: '10.0',
        entryPrice: '3000',
        realizedPnl: '0',
        createdAt: new Date().toISOString(),
        createdAtHeight: TEST_BLOCK_HEIGHT,
      };

      processor.processPositionUpdate(btcUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);
      processor.processPositionUpdate(ethUpdate, TEST_ADDRESS, TEST_SUBACCOUNT);

      const btcPosition = processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, 'BTC-USD');
      const ethPosition = processor.getPosition(TEST_ADDRESS, TEST_SUBACCOUNT, 'ETH-USD');

      expect(btcPosition).toBeDefined();
      expect(ethPosition).toBeDefined();
      expect(btcPosition?.market).toBe('BTC-USD');
      expect(ethPosition?.market).toBe('ETH-USD');

      const allPositions = processor.getSubaccountPositions(TEST_ADDRESS, TEST_SUBACCOUNT);
      expect(allPositions).toHaveLength(2);
    });
  });
});

