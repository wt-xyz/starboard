import { type FC, useEffect, useMemo } from 'react';
import type { PositionEntity } from 'fuel-ts-sdk/trading';
import { TradeHistoryCard } from '@/@starboard/pages/Dashboard/components/ExchangeLists/components/TradeHistoryCard';
import * as $ from '@/@starboard/pages/Dashboard/components/ExchangeLists/components/TradeHistoryList.css';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { PositionsTable } from '../../../../submodules';

export const TradeHistoryList: FC = () => {
  const trading = useTradingSdk();
  const userAddress = useSdkQuery((sdk) => sdk.accounts.getCurrentUserAddress());

  useEffect(() => {
    if (userAddress) {
      trading.syncPositionsByAccount(userAddress);
      return () => trading.desyncPositionsByAccount(userAddress);
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

  const isEmpty = sortedRevisions.length === 0;

  return (
    <>
      <div css={$.desktopView}>
        <PositionsTable.Root
          header={
            <PositionsTable.Header>
              {(h) => (
                <>
                  <h.Time />
                  <h.Position />
                  <h.Direction />
                  <h.MarkPrice />
                  <h.SizeDelta />
                  <h.TradeValue />
                  <h.Fees />
                  <h.PnlDelta />
                </>
              )}
            </PositionsTable.Header>
          }
          body={sortedRevisions.map((position) => (
            <PositionsTable.Row key={position.revisionId} position={position}>
              {(r) => (
                <>
                  <r.TimestampCell />
                  <r.PositionCell />
                  <r.ActionCell />
                  <r.MarkPriceCell />
                  <r.SizeDeltaCell />
                  <r.TradeValueCell />
                  <r.FeesCell />
                  <r.PnlDeltaCell />
                </>
              )}
            </PositionsTable.Row>
          ))}
        />
        {isEmpty && (
          <div css={$.emptyState}>
            <span css={$.emptyStateText}>No trade history yet</span>
          </div>
        )}
      </div>

      <div css={$.mobileView}>
        {isEmpty ? (
          <div css={$.emptyState}>
            <span css={$.emptyStateText}>No trade history yet</span>
          </div>
        ) : (
          <div css={$.cardList}>
            {sortedRevisions.map((position) => (
              <TradeHistoryCard key={position.revisionId} position={position} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
