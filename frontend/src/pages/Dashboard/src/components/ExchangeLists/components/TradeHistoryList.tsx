import { type FC, useEffect, useMemo } from 'react';
import type { PositionEntity } from 'fuel-ts-sdk/trading';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { PositionsTable } from '../../../../submodules';
import * as $ from './TradeHistoryList.css';

export const TradeHistoryList: FC = () => {
  const trading = useTradingSdk();
  const userAddress = useSdkQuery((sdk) => sdk.accounts.getCurrentUserAddress());

  useEffect(() => {
    if (userAddress) {
      trading.syncPositionsByAccount(userAddress);
      return () => trading.desyncPositionsByAccount();
    }
  }, [trading, userAddress]);

  const allRevisions = useSdkQuery((sdk) => {
    if (!userAddress) return [];
    const state = sdk.store.getState();
    const positions = state.trading.positions.positions;
    return positions.ids
      .map((id) => positions.entities[id as keyof typeof positions.entities])
      .filter((p): p is PositionEntity => !!p && p.accountAddress === userAddress);
  });

  const sortedRevisions = useMemo(
    () => [...allRevisions].sort((a, b) => b.timestamp - a.timestamp),
    [allRevisions]
  );

  if (sortedRevisions.length === 0) {
    return (
      <div css={$.emptyState}>
        <span css={$.emptyStateText}>No trade history yet</span>
      </div>
    );
  }

  return (
    <PositionsTable.Root
      header={
        <PositionsTable.Header>
          {(h) => (
            <>
              <h.Action />
              <h.Custom>Market</h.Custom>
              <h.Size />
              <h.MarkPrice />
              <h.RealizedPnl />
            </>
          )}
        </PositionsTable.Header>
      }
      body={sortedRevisions.map((position) => (
        <PositionsTable.Row key={position.revisionId} position={position}>
          {(r) => (
            <>
              <r.ActionCell />
              <r.PositionCell />
              <r.SizeCell />
              <r.MarkPriceCell />
              <r.RealizedPnlCell />
            </>
          )}
        </PositionsTable.Row>
      ))}
    />
  );
};
