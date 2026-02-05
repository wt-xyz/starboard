import { createContext } from 'react';
import type { Signal } from '@preact/signals-react';

export type OptionsContextType = {
  baseAssetSymbol?: string;
  quoteAssetSymbol?: string;
  userBalanceInBaseAsset?: number;
  currentCollateral?: number;
  currentQuoteAssetPrice?: Signal<number>;
  currentBaseAssetPrice?: Signal<number>;
  positionEntryPrice?: number;
  maxLeverage?: number;
  minCollateral?: number;
  minPositionSize?: number;
  maxPositionSize?: number;
  maxPriceDeviation?: number;
  initialMarginFraction?: number;
  maintenanceMarginFraction?: number;
  warnHighLeverage?: boolean;
};

export const OptionsContext = createContext<OptionsContextType>({});

OptionsContext.displayName = 'PositionFormOptions';
