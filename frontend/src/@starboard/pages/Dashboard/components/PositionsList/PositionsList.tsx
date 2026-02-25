import { type FC, useEffect, useMemo } from 'react';
import { PositionSide } from 'fuel-ts-sdk/trading';
import * as $ from '@/@starboard/pages/Dashboard/components/PositionsList/PositionsList.css';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { PositionCard } from '@/pages/Dashboard/src/components/PositionsList/components/PositionCard';
import { PositionsTable } from '@/pages/Dashboard/src/components/PositionsList/components/PositionsTable';

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

  return (
    <div css={$.positionsContainer}>
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
