import type { FC } from 'react';
import { PositionsTable } from '../../../../submodules';
import * as $ from './TradeHistoryList.css';

export const OpenOrdersList: FC = () => {
  return (
    <>
      <PositionsTable.Root
        header={
          <PositionsTable.Header>
            {(h) => (
              <>
                <h.Time />
                <h.Position />
                <h.Custom>Type</h.Custom>
                <h.Custom>Side</h.Custom>
                <h.Custom>Price</h.Custom>
                <h.Size />
                <h.Custom>Filled</h.Custom>
                <h.Custom>Status</h.Custom>
              </>
            )}
          </PositionsTable.Header>
        }
        body={null}
      />
      <div css={$.emptyState}>
        <span css={$.emptyStateText}>No open orders</span>
      </div>
    </>
  );
};
