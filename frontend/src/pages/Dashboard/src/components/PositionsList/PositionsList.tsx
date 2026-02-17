import { type FC, useEffect, useMemo } from 'react';
import { PositionSide } from 'fuel-ts-sdk/trading';
import { toast } from 'react-toastify';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import * as $ from './PositionsList.css';
import { PositionCard } from './components/PositionCard';
import { PositionsTable } from './components/PositionsTable';

type PositionsListProps = {
  side?: 'long' | 'short';
};

export const PositionsList: FC<PositionsListProps> = ({ side }) => {
  const trading = useTradingSdk();
  const userAddress = useSdkQuery((sdk) => sdk.accounts.getCurrentUserAddress());

  const accountOpenPositions = useSdkQuery(() => trading.getCurrentAccountOpenPositions());

  const filteredOpenPositions = useMemo(() => {
    if (!side) return accountOpenPositions;
    return accountOpenPositions.filter((openPosition) => {
      const isLong = openPosition.side === PositionSide.LONG;
      return side === 'long' ? isLong : !isLong;
    });
  }, [accountOpenPositions, side]);

  useEffect(() => {
    if (userAddress) {
      trading.syncPositionsByAccount(userAddress);
      return () => trading.desyncPositionsByAccount(userAddress);
    }
  }, [trading, userAddress]);

  const isEmpty = filteredOpenPositions.length === 0;

  const handleCloseAll = useCallback(async () => {
    for (const position of filteredOpenPositions) {
      try {
        await trading.decreasePosition({
          positionId: position.stableId,
          sizeDelta: position.size,
        });
      } catch (error) {
        toast.error(`Failed to close position`);
      }
    }
    toast.success('All positions closed');
  }, [filteredOpenPositions, trading]);

  return (
    <div css={$.positionsContainer}>
      {!isEmpty && (
        <div css={$.header}>
          <span css={$.headerTitle} />
          <button css={$.closeAllButton} onClick={handleCloseAll}>
            Close All
          </button>
        </div>
      )}
      <div css={$.desktopView}>
        <PositionsTable entries={filteredOpenPositions} />
        {isEmpty && (
          <div css={$.emptyState}>
            <span css={$.emptyStateText}>No open positions</span>
          </div>
        )}
      </div>

      <div css={$.mobileView}>
        {isEmpty ? (
          <div css={$.emptyState}>
            <span css={$.emptyStateText}>No open positions</span>
          </div>
        ) : (
          <div css={$.positionCards}>
            {filteredOpenPositions.map((openPosition) => (
              <PositionCard key={openPosition.revisionId} position={openPosition} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
