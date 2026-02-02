import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { $decimalValue } from 'fuel-ts-sdk';
import { PositionChange, type PositionEntity } from 'fuel-ts-sdk/trading';
import { type FC } from 'react';
import * as styles from './TradeHistoryList.css';

type TradeHistoryCardProps = {
  position: PositionEntity;
};

export const TradeHistoryCard: FC<TradeHistoryCardProps> = ({ position }) => {
  const tradingSdk = useTradingSdk();
  const asset = useSdkQuery(() => tradingSdk.getAssetById(position.assetId));
  const assetName = asset?.name || 'Unknown';
  const realizedPnl = $decimalValue(position.realizedPnl).toFloat();
  const isProfitable = realizedPnl >= 0;
  const isLiquidated = position.change === PositionChange.LIQUIDATE;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div css={styles.historyCard}>
      <div css={styles.cardHeader}>
        <div css={styles.assetInfo}>
          <span css={styles.assetName}>{assetName}</span>
          <span css={styles.sideBadge} data-side={position.side}>
            {position.side}
          </span>
          {isLiquidated && (
            <span css={styles.closeBadge} data-liquidated="true">
              LIQUIDATED
            </span>
          )}
        </div>
        <span css={styles.timestamp}>{formatTimestamp(position.timestamp)}</span>
      </div>

      <div css={styles.pnlRow}>
        <span css={styles.pnlLabel}>Realized P&L</span>
        <span css={styles.pnlValue} data-positive={isProfitable}>
          {isProfitable ? '+' : ''}
          {formatPrice(realizedPnl)}
        </span>
      </div>

      <div css={styles.statsRow}>
        <div css={styles.statItem}>
          <span css={styles.statLabel}>Entry Price</span>
          <span css={styles.statValue}>
            {formatPrice($decimalValue(position.entryPrice).toFloat())}
          </span>
        </div>
        <div css={styles.statItem}>
          <span css={styles.statLabel}>Size</span>
          <span css={styles.statValue}>
            {$decimalValue(position.sizeDelta).toFloat().toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
