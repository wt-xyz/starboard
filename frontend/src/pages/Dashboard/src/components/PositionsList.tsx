import { type FC, useCallback, useMemo } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { usePolling } from '@/lib/usePolling';
import { PositionCard } from './PositionCard';
import * as styles from './PositionsList.css';

type PositionsListProps = {
  filterBySide?: 'long' | 'short';
};

export const PositionsList: FC<PositionsListProps> = ({ filterBySide }) => {
  const trading = useTradingSdk();
  const userAddress = useSdkQuery((sdk) => sdk.accounts.getCurrentUserAddress());

  const accountOpenPositions = useSdkQuery(() => trading.getAccountOpenPositions(userAddress));

  const filteredOpenPositions = useMemo(() => {
    if (!filterBySide) return accountOpenPositions;
    return accountOpenPositions.filter((openPosition) => {
      const isLong = openPosition.positionKey.isLong;
      return filterBySide === 'long' ? isLong : !isLong;
    });
  }, [accountOpenPositions, filterBySide]);

  const totalExposure = useSdkQuery(trading.getCurrentAccountTotalExposure);

  usePolling(
    useCallback(() => {
      if (userAddress) trading.fetchPositionsByAccount(userAddress, true);
    }, [trading, userAddress])
  );

  if (filteredOpenPositions.length === 0) return null;

  return (
    <div css={styles.positionsContainer}>
      <div css={styles.header}>
        <span css={styles.headerTitle}>Open Positions ({filteredOpenPositions.length})</span>
        <div css={styles.headerStats}>
          <div css={styles.statItem}>
            <span css={styles.statLabel}>Exposure</span>
            <span css={styles.statValue}>
              $
              {$decimalValue(totalExposure)
                .toFloat()
                .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
      <div css={styles.positionCards}>
        {filteredOpenPositions.map((openPosition) => (
          <PositionCard key={openPosition.revisionId} position={openPosition} />
        ))}
      </div>
    </div>
  );
};
