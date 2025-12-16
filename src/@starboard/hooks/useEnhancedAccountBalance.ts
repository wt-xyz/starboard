import { useMemo } from 'react';

import { BonsaiCore } from '@/bonsai/ontology';
import { MOCK_POSITION_COLLATERAL } from '@/mocks/mockPositions';

import {
  getOpenPositions,
  getSubaccountEquity,
  getSubaccountFreeCollateral,
  getSubaccountOpenOrders,
} from '@/state/accountSelectors';
import { useAppSelector } from '@/state/appTypes';

import { BIG_NUMBERS, MaybeBigNumber } from '@/lib/numbers';
import { orEmptyRecord } from '@/lib/typeUtils';

import { useAccountBalance } from './useAccountBalance';

export enum MarginHealthLevel {
  Healthy = 'healthy',
  Warning = 'warning',
  Danger = 'danger',
}

export interface EnhancedBalanceData {
  // Core balances
  totalUsdcBalance: number; // Total USDC from Fuel RPC
  equity: number | undefined; // Total equity including positions
  freeCollateral: number | undefined; // Available collateral from subaccount
  pendingOrdersMargin: number;
  usedCollateral: number;
  availableCollateral: number;
  positionsCollateral: PositionCollateralBreakdown[];

  marginUtilization: number | undefined; // (usedCollateral / totalBalance) * 100
  marginHealthLevel: MarginHealthLevel;

  // Status flags
  isOffline: boolean;
  error: Error | null;
}

export const useEnhancedAccountBalance = (): EnhancedBalanceData => {
  const { usdcBalance, isOffline, error } = useAccountBalance();
  const equity = useAppSelector(getSubaccountEquity);
  const freeCollateral = useAppSelector(getSubaccountFreeCollateral);
  const openOrders = useAppSelector(getSubaccountOpenOrders) ?? [];
  const openPositions = useAppSelector(getOpenPositions) ?? [];
  const marketSummaries = orEmptyRecord(useAppSelector(BonsaiCore.markets.markets.data));
  const usePositionMocks =
    import.meta.env.VITE_ENABLE_POSITION_MOCKS === 'true' && import.meta.env.DEV;

  return useMemo(() => {
    const fallbackBalance = freeCollateral ?? equity ?? 0;
    const hasUsdcBalance = usdcBalance != null && Number.isFinite(usdcBalance);
    const totalUsdcBalance = hasUsdcBalance
      ? Math.max(usdcBalance, 0)
      : Math.max(fallbackBalance, 0);

    const positionsCollateralBase = openPositions
      .map((position) => {
        const v1 = position.marginValueInitial.toNumber();
        const marginValueInitial = Number.isFinite(v1) && v1 !== 0 ? v1 : undefined;

        const v2 = position.initialRisk.toNumber();
        const initialRisk = Number.isFinite(v2) && v2 !== 0 ? v2 : undefined;

        const v3 = position.notional.times(position.adjustedImf ?? BIG_NUMBERS.ZERO).toNumber();
        const derived = Number.isFinite(v3) && v3 > 0 ? v3 : undefined;

        const marginValue = marginValueInitial ?? initialRisk ?? derived;
        if (!marginValue || marginValue <= 0 || !Number.isFinite(marginValue)) return undefined;

        const marketMeta = marketSummaries[position.market];
        const ticker = marketMeta?.displayableTicker ?? position.market;

        return {
          marketId: position.market,
          ticker,
          marginValue,
        };
      })
      .filter((entry): entry is PositionCollateralBreakdownBase => Boolean(entry));

    const effectivePositionsCollateralBase =
      positionsCollateralBase.length === 0 && usePositionMocks
        ? MOCK_POSITION_COLLATERAL
        : positionsCollateralBase;

    const usedCollateral = effectivePositionsCollateralBase.reduce(
      (acc, entry) => acc + entry.marginValue,
      0
    );

    const pendingOrdersMargin = openOrders.reduce((acc, order) => {
      if (order.reduceOnly) return acc;

      const remainingSize = order.remainingSize ?? order.size;
      if (!remainingSize || remainingSize.isZero()) return acc;

      const notional = order.price.multipliedBy(remainingSize.abs());
      if (!notional.isFinite() || notional.isZero()) return acc;

      const market = marketSummaries[order.marketId];
      const imf =
        MaybeBigNumber(market?.effectiveInitialMarginFraction) ??
        MaybeBigNumber(market?.initialMarginFraction);

      if (!imf || imf.isZero()) {
        // fallback to constant 10% if margin data missing (helps mock environments)
        return acc + notional.multipliedBy(0.1).toNumber();
      }

      const marginRequirement = notional.multipliedBy(imf);
      if (!marginRequirement.isFinite()) return acc;

      return acc + Math.max(marginRequirement.toNumber(), 0);
    }, 0);

    const totalUsedIncludingPending = usedCollateral + pendingOrdersMargin;
    const availableCollateral = Math.max(totalUsdcBalance - totalUsedIncludingPending, 0);

    const marginUtilization =
      totalUsdcBalance > 0 ? (totalUsedIncludingPending / totalUsdcBalance) * 100 : undefined;

    // Determine margin health level based on utilization
    let marginHealthLevel: MarginHealthLevel;
    if (marginUtilization == null || marginUtilization < 50) {
      marginHealthLevel = MarginHealthLevel.Healthy;
    } else if (marginUtilization < 80) {
      marginHealthLevel = MarginHealthLevel.Warning;
    } else {
      marginHealthLevel = MarginHealthLevel.Danger;
    }

    const positionsCollateral: PositionCollateralBreakdown[] = effectivePositionsCollateralBase
      .map((entry) => ({
        ...entry,
        percentOfUsedCollateral: usedCollateral > 0 ? entry.marginValue / usedCollateral : 0,
      }))
      .sort((a, b) => b.marginValue - a.marginValue);

    return {
      totalUsdcBalance,
      equity,
      freeCollateral,
      pendingOrdersMargin,
      usedCollateral,
      availableCollateral,
      positionsCollateral,
      marginUtilization,
      marginHealthLevel,
      isOffline,
      error,
    };
  }, [
    usdcBalance,
    equity,
    freeCollateral,
    openOrders,
    openPositions,
    marketSummaries,
    isOffline,
    error,
  ]);
};

type PositionCollateralBreakdownBase = {
  marketId: string;
  ticker: string;
  marginValue: number;
};

export type PositionCollateralBreakdown = PositionCollateralBreakdownBase & {
  percentOfUsedCollateral: number;
};
