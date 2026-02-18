import { type FC, useEffect, useMemo } from 'react';
import { PositionSide } from 'fuel-ts-sdk/trading';
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

  if (filteredOpenPositions.length === 0) {
    return (
      <div css={$.positionsContainer}>
        <div style={{ textAlign: 'center', color: '#878787', padding: '3rem 1rem' }}>
          No open positions
        </div>
      </div>
    );
  }

  return (
    <div css={$.positionsContainer}>
      <div css={$.desktopView}>
        <PositionsTable entries={filteredOpenPositions} />
      </div>

      <div css={$.mobileView}>
        <div css={$.positionCards}>
          {filteredOpenPositions.map((openPosition) => (
            <PositionCard key={openPosition.revisionId} position={openPosition} />
          ))}
        </div>
      </div>
    </div>
  );
};
