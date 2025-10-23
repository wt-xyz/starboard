import { EventEmitter } from 'events';
import {
  Position,
  PositionChange,
  PositionKey,
} from '../types/indexer';

export interface PositionUpdate {
  indexAssetId: string;
  account: string;
  isLong: boolean;
  collateralAmout?: string;
  size?: string;
  change?: PositionChange;
  timestamp?: number;
}

export interface PositionEvent {
  type: PositionChange;
  position: Position;
  previousPosition?: Position;
  timestamp: number;
  blockHeight?: string;
}

export interface PositionAnalytics {
  positionId: string;
  account: string;
  indexAssetId: string;
  isLong: boolean;
  size: string;
  collateralAmout: string;
  change: PositionChange;
  timestamp: number;
  blockHeight?: string;
}

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
    blockHeight?: string
  ): PositionEvent | null {
    try {
      const positionKey: PositionKey = {
        id: this.getPositionKeyId(update.account, update.indexAssetId, update.isLong),
        account: update.account,
        indexAssetId: update.indexAssetId,
        isLong: update.isLong,
      };

      const keyString = positionKey.id;
      const existingPosition = this.positions.get(keyString);
      
      const change = this.determineChange(update, existingPosition);
      if (!change) {
        return null;
      }

      const updatedPosition: Position = {
        id: this.generatePositionId(update, blockHeight),
        positionKey,
        collateralAmout: update.collateralAmout || existingPosition?.collateralAmout || '0',
        size: update.size || existingPosition?.size || '0',
        timestamp: update.timestamp || Date.now(),
        latest: true,
        change,
      };

      // Mark previous position as not latest
      if (existingPosition) {
        existingPosition.latest = false;
      }

      this.positions.set(keyString, updatedPosition);

      if (change === PositionChange.INCREASE && !existingPosition) {
        this.positionOpenTimes.set(keyString, Date.now());
      }

      const event: PositionEvent = {
        type: change,
        position: updatedPosition,
        previousPosition: existingPosition,
        timestamp: updatedPosition.timestamp,
        blockHeight,
      };

      this.emit('position_event', event);
      this.emit(change.toLowerCase(), event);

      if (this.config.enableAnalytics) {
        this.trackAnalytics(event);
      }

      if (change === PositionChange.CLOSE || change === PositionChange.LIQUIDATE) {
        this.positions.delete(keyString);
        this.positionOpenTimes.delete(keyString);
      }

      if (this.config.debug) {
        console.log('[PositionEventProcessor] Event:', change, updatedPosition);
      }

      return event;
    } catch (error) {
      this.handleError(error as Error);
      return null;
    }
  }

  public processPositionUpdates(
    updates: PositionUpdate[],
    blockHeight?: string
  ): PositionEvent[] {
    const events: PositionEvent[] = [];
    
    for (const update of updates) {
      const event = this.processPositionUpdate(update, blockHeight);
      if (event) {
        events.push(event);
      }
    }
    
    return events;
  }

  public getPosition(account: string, indexAssetId: string, isLong: boolean): Position | undefined {
    const key = this.getPositionKeyId(account, indexAssetId, isLong);
    return this.positions.get(key);
  }

  public getAccountPositions(account: string): Position[] {
    const positions: Position[] = [];
    
    this.positions.forEach((position) => {
      if (position.positionKey.account === account) {
        positions.push(position);
      }
    });
    
    return positions;
  }

  public getAllLatestPositions(): Position[] {
    const latestPositions: Position[] = [];
    
    this.positions.forEach((position) => {
      if (position.latest) {
        latestPositions.push(position);
      }
    });
    
    return latestPositions;
  }

  public clear(): void {
    this.positions.clear();
    this.positionOpenTimes.clear();
  }

  private determineChange(
    update: PositionUpdate,
    existing?: Position
  ): PositionChange | null {
    // If change is explicitly provided, use it
    if (update.change) {
      return update.change;
    }

    // If no existing position, this is a new position (INCREASE)
    if (!existing) {
      return PositionChange.INCREASE;
    }

    // If size is provided and changed
    if (update.size !== undefined) {
      const newSize = BigInt(update.size);
      const oldSize = BigInt(existing.size);

      if (newSize === BigInt(0)) {
        return PositionChange.CLOSE;
      } else if (newSize > oldSize) {
        return PositionChange.INCREASE;
      } else if (newSize < oldSize) {
        return PositionChange.DECREASE;
      }
    }

    return null;
  }

  private getPositionKeyId(account: string, indexAssetId: string, isLong: boolean): string {
    return `${account}:${indexAssetId}:${isLong}`;
  }

  private generatePositionId(update: PositionUpdate, blockHeight?: string): string {
    const timestamp = update.timestamp || Date.now();
    return `${update.account}:${update.indexAssetId}:${update.isLong}:${timestamp}:${blockHeight || ''}`;
  }

  private trackAnalytics(event: PositionEvent): void {
    try {
      const { position, type } = event;
      const positionKey = this.getPositionKeyId(
        position.positionKey.account,
        position.positionKey.indexAssetId,
        position.positionKey.isLong
      );

      const analytics: PositionAnalytics = {
        positionId: position.id,
        account: position.positionKey.account,
        indexAssetId: position.positionKey.indexAssetId,
        isLong: position.positionKey.isLong,
        size: position.size,
        collateralAmout: position.collateralAmout,
        change: type,
        timestamp: position.timestamp,
        blockHeight: event.blockHeight,
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
  public on(event: 'increase', listener: (event: PositionEvent) => void): this;
  public on(event: 'decrease', listener: (event: PositionEvent) => void): this;
  public on(event: 'close', listener: (event: PositionEvent) => void): this;
  public on(event: 'liquidate', listener: (event: PositionEvent) => void): this;
  public on(event: 'error', listener: (error: Error) => void): this;
  public on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

