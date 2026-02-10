import { type FC, useCallback, useMemo } from 'react';
import { PositionSide } from 'fuel-ts-sdk/trading';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { usePolling } from '@/lib/usePolling';
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
