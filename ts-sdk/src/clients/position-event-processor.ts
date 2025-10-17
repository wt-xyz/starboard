import { EventEmitter } from 'events';
import {
  Position,
  PositionAnalytics,
  PositionEvent,
  PositionEventType,
  PositionSide,
  PositionStatus,
  PositionUpdate,
  calculateLiquidationPrice,
  calculateRealizedPnlPercent,
} from './position-event-types';

export interface PositionEventProcessorConfig {
  enableAnalytics?: boolean;
  onAnalytics?: (analytics: PositionAnalytics) => void;
  onError?: (error: Error) => void;
  debug?: boolean;
}

export class PositionEventProcessor extends EventEmitter {
  private positions: Map<string, Position> = new Map();
  private config: PositionEventProcessorConfig;
  private positionOpenTimes: Map<string, number> = new Map();

  constructor(config: PositionEventProcessorConfig = {}) {
    super();
    this.config = {
      enableAnalytics: true,
      debug: false,
      ...config,
    };
  }

  public processPositionUpdate(
    update: PositionUpdate,
    address: string,
    subaccountNumber: number,
    blockHeight?: string
  ): PositionEvent | null {
    try {
      const positionKey = this.getPositionKey(address, subaccountNumber, update.market);
      const existingPosition = this.positions.get(positionKey);
      
      const eventType = this.determineEventType(update, existingPosition);
      
      if (!eventType) {
        return null;
      }

      const updatedPosition: Position = existingPosition
        ? { ...existingPosition, ...update }
        : this.createNewPosition(update);

      this.positions.set(positionKey, updatedPosition);

      if (eventType === PositionEventType.POSITION_OPENED) {
        this.positionOpenTimes.set(positionKey, Date.now());
      }

      const event: PositionEvent = {
        type: eventType,
        position: updatedPosition,
        previousPosition: existingPosition,
        timestamp: Date.now(),
        blockHeight,
        subaccount: {
          address,
          subaccountNumber,
        },
      };

      this.emit('position_event', event);
      this.emit(eventType.toLowerCase(), event);

      if (this.config.enableAnalytics) {
        this.trackAnalytics(event);
      }

      if (
        eventType === PositionEventType.POSITION_CLOSED ||
        eventType === PositionEventType.POSITION_LIQUIDATED
      ) {
        this.positions.delete(positionKey);
        this.positionOpenTimes.delete(positionKey);
      }

      if (this.config.debug) {
        console.log('[PositionEventProcessor] Event:', eventType, updatedPosition);
      }

      return event;
    } catch (error) {
      this.handleError(error as Error);
      return null;
    }
  }

  public processPositionUpdates(
    updates: PositionUpdate[],
    address: string,
    subaccountNumber: number,
    blockHeight?: string
  ): PositionEvent[] {
    const events: PositionEvent[] = [];
    
    for (const update of updates) {
      const event = this.processPositionUpdate(update, address, subaccountNumber, blockHeight);
      if (event) {
        events.push(event);
      }
    }
    
    return events;
  }

  public getPosition(address: string, subaccountNumber: number, market: string): Position | undefined {
    const key = this.getPositionKey(address, subaccountNumber, market);
    return this.positions.get(key);
  }

  public getSubaccountPositions(address: string, subaccountNumber: number): Position[] {
    const positions: Position[] = [];
    const prefix = `${address}:${subaccountNumber}:`;
    
    this.positions.forEach((position, key) => {
      if (key.startsWith(prefix)) {
        positions.push(position);
      }
    });
    
    return positions;
  }

  public getAllOpenPositions(): Position[] {
    const openPositions: Position[] = [];
    
    this.positions.forEach((position) => {
      if (position.status === PositionStatus.OPEN) {
        openPositions.push(position);
      }
    });
    
    return openPositions;
  }

  public clear(): void {
    this.positions.clear();
    this.positionOpenTimes.clear();
  }

  private determineEventType(
    update: PositionUpdate,
    existing?: Position
  ): PositionEventType | null {
    if (!existing) {
      return PositionEventType.POSITION_OPENED;
    }

    if (update.status === PositionStatus.LIQUIDATED) {
      return PositionEventType.POSITION_LIQUIDATED;
    }

    if (
      existing.status === PositionStatus.OPEN &&
      update.status === PositionStatus.CLOSED
    ) {
      return PositionEventType.POSITION_CLOSED;
    }

    if (update.size && update.size !== existing.size) {
      return PositionEventType.POSITION_MODIFIED;
    }

    return null;
  }

  private createNewPosition(update: PositionUpdate): Position {
    return {
      market: update.market,
      status: update.status || PositionStatus.OPEN,
      side: update.side || PositionSide.LONG,
      size: update.size || '0',
      maxSize: update.maxSize || update.size || '0',
      entryPrice: update.entryPrice || '0',
      exitPrice: update.exitPrice,
      realizedPnl: update.realizedPnl || '0',
      unrealizedPnl: update.unrealizedPnl,
      createdAt: update.createdAt || new Date().toISOString(),
      createdAtHeight: update.createdAtHeight || '0',
      closedAt: update.closedAt,
      subaccountNumber: update.subaccountNumber,
      sumOpen: update.sumOpen,
      sumClose: update.sumClose,
      netFunding: update.netFunding,
    };
  }

  private getPositionKey(address: string, subaccountNumber: number, market: string): string {
    return `${address}:${subaccountNumber}:${market}`;
  }

  private trackAnalytics(event: PositionEvent): void {
    try {
      const { position, type, subaccount } = event;
      const positionKey = this.getPositionKey(
        subaccount.address,
        subaccount.subaccountNumber,
        position.market
      );

      const entryPrice = parseFloat(position.entryPrice);
      const exitPrice = position.exitPrice ? parseFloat(position.exitPrice) : undefined;
      const size = parseFloat(position.size);
      const realizedPnl = parseFloat(position.realizedPnl);

      let durationSeconds: number | undefined;
      if (
        type === PositionEventType.POSITION_CLOSED ||
        type === PositionEventType.POSITION_LIQUIDATED
      ) {
        const openTime = this.positionOpenTimes.get(positionKey);
        if (openTime) {
          durationSeconds = Math.floor((Date.now() - openTime) / 1000);
        }
      }

      let liquidationPrice: number | undefined;
      if (entryPrice > 0 && size > 0) {
        const sizeUsd = entryPrice * size;
        const estimatedLeverage = 10;
        liquidationPrice = calculateLiquidationPrice(
          entryPrice,
          estimatedLeverage,
          position.side
        );
      }

      const analytics: PositionAnalytics = {
        positionId: positionKey,
        market: position.market,
        side: position.side,
        entryPrice,
        exitPrice,
        sizeUsd: entryPrice * size,
        liquidationPrice,
        durationSeconds,
        realizedPnl,
        realizedPnlPercent: calculateRealizedPnlPercent(realizedPnl, entryPrice, size),
        eventType: type,
        timestamp: event.timestamp,
        address: subaccount.address,
        subaccountNumber: subaccount.subaccountNumber,
      };

      this.emit('position_analytics', analytics);

      if (this.config.onAnalytics) {
        this.config.onAnalytics(analytics);
      }

      if (this.config.debug) {
        console.log('[PositionEventProcessor] Analytics:', analytics);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }


  private handleError(error: Error): void {
    if (this.config.debug) {
      console.error('[PositionEventProcessor] Error:', error);
    }

    this.emit('error', error);

    if (this.config.onError) {
      this.config.onError(error);
    }
  }


  public on(event: 'position_event', listener: (event: PositionEvent) => void): this;
  public on(event: 'position_analytics', listener: (analytics: PositionAnalytics) => void): this;
  public on(event: 'position_opened', listener: (event: PositionEvent) => void): this;
  public on(event: 'position_modified', listener: (event: PositionEvent) => void): this;
  public on(event: 'position_closed', listener: (event: PositionEvent) => void): this;
  public on(event: 'position_liquidated', listener: (event: PositionEvent) => void): this;
  public on(event: 'error', listener: (error: Error) => void): this;
  public on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

