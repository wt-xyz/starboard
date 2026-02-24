import type { FC } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { type PositionEntity, PositionChange, PositionSide } from 'fuel-ts-sdk/trading';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from './TradeHistoryCard.css';

type TradeHistoryCardProps = {
  position: PositionEntity;
};

export const TradeHistoryCard: FC<TradeHistoryCardProps> = ({ position }) => {
  const tradingSdk = useTradingSdk();
  const asset = useSdkQuery(() => tradingSdk.getAssetById(position.assetId));

  const isLong = position.side === PositionSide.LONG;

  const date = new Date(position.timestamp * 1000);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const entryPrice = $decimalValue(position.entryPrice).toFloat();
  const sizeDelta = Math.abs($decimalValue(position.sizeDelta).toFloat());
  const collateralDelta = Math.abs($decimalValue(position.collateralDelta).toFloat());

  const liquidityFee = $decimalValue(position.outLiquidityFee).toFloat();
  const protocolFee = $decimalValue(position.outProtocolFee).toFloat();
  const liquidationFee = $decimalValue(position.outLiquidationFee).toFloat();
  const totalFees = liquidityFee + protocolFee + liquidationFee;

  const pnlValue = $decimalValue(position.pnlDelta).toFloat();
  const pnlSign = pnlValue >= 0 ? '+' : '';
  const pnlStyle = pnlValue > 0 ? $.pnlPositive : pnlValue < 0 ? $.pnlNegative : $.pnlMuted;

  return (
    <div css={$.card}>
      <div css={$.header}>
        <span css={[$.side, isLong ? $.sideLong : $.sideShort]}>
          {isLong ? 'LONG' : 'SHORT'}
        </span>
        <span css={$.assetName}>{asset?.name}</span>
        <span css={$.actionLabel}>{changeLabels[position.change]}</span>
      </div>

      <span css={$.timestamp}>
        {dateStr}, {timeStr}
      </span>

      <div css={$.statsGrid}>
        <div css={$.statItem}>
          <span css={$.statLabel}>Price</span>
          <span css={$.statValue}>${formatCurrency(entryPrice)}</span>
        </div>
        <div css={$.statItem}>
          <span css={$.statLabel}>Size</span>
          <span css={$.statValue}>${formatCurrency(sizeDelta)}</span>
        </div>
        <div css={$.statItem}>
          <span css={$.statLabel}>Trade Value</span>
          <span css={$.statValue}>${formatCurrency(collateralDelta)}</span>
        </div>
        <div css={$.statItem}>
          <span css={$.statLabel}>Fees</span>
          <span css={$.statValue}>${formatCurrency(totalFees)}</span>
        </div>
        <div css={$.statItem}>
          <span css={$.statLabel}>PnL</span>
          <span css={[$.statValue, pnlStyle]}>
            {pnlSign}${formatCurrency(pnlValue)}
          </span>
        </div>
      </div>
    </div>
  );
};

const changeLabels: Record<PositionChange, string> = {
  [PositionChange.INCREASE]: 'Deposit',
  [PositionChange.DECREASE]: 'Withdraw',
  [PositionChange.CLOSE]: 'Close',
  [PositionChange.LIQUIDATE]: 'Liquidate',
};
