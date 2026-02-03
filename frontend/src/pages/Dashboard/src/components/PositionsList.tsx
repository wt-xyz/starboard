import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { usePolling } from '@/lib/usePolling';
import { $decimalValue, BigIntMath, DecimalCalculator, UsdValue, zero } from 'fuel-ts-sdk';
import { PositionSide } from 'fuel-ts-sdk/trading';
import { useCallback, useMemo, type FC } from 'react';
import { PositionCard } from './PositionCard';
import * as styles from './PositionsList.css';
import { PositionsTable } from './PositionsTable';

type PositionsListProps = {
  filterBySide?: 'long' | 'short';
};

export const PositionsList: FC<PositionsListProps> = ({ filterBySide }) => {
  const trading = useTradingSdk();
  const userAddress = useSdkQuery((sdk) => sdk.accounts.getCurrentUserAddress());

  const accountOpenPositions = useSdkQuery(() => trading.getCurrentAccountOpenPositions());

  const filteredOpenPositions = useMemo(() => {
    if (!filterBySide) return accountOpenPositions;
    return accountOpenPositions.filter((openPosition) => {
      const isLong = openPosition.side === PositionSide.LONG;
      return filterBySide === 'long' ? isLong : !isLong;
    });
  }, [accountOpenPositions, filterBySide]);

  const totalExposure = useMemo(() => {
    return filteredOpenPositions.reduce((total, position) => {
      const positionNotional = DecimalCalculator.value(BigIntMath.abs(position.size)).calculate(
        UsdValue
      );
      return DecimalCalculator.first(total).add(positionNotional).calculate(UsdValue);
    }, zero(UsdValue));
  }, [filteredOpenPositions]);

  usePolling(
    useCallback(() => {
      if (userAddress) trading.fetchPositionsByAccount(userAddress, true);
    }, [trading, userAddress])
  );

  if (filteredOpenPositions.length === 0) {
    return (
      <div css={styles.positionsContainer}>
        <div style={{ textAlign: 'center', color: '#878787', padding: '3rem 1rem' }}>
          No open positions
        </div>
      </div>
    );
  }

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
      
      {/* Desktop: Table view */}
      <div css={styles.desktopView}>
        <PositionsTable positions={filteredOpenPositions} />
      </div>

      {/* Mobile: Card view */}
      <div css={styles.mobileView}>
        <div css={styles.positionCards}>
          {filteredOpenPositions.map((openPosition) => (
            <PositionCard key={openPosition.revisionId} position={openPosition} />
          ))}
        </div>
      </div>
    </div>
  );
};
