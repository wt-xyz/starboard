import type { FC } from 'react';
import { PositionsTable } from '../../../../submodules';
import * as $ from './TradeHistoryList.css';

export const FundingHistoryList: FC = () => {
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
                  <h.Custom>Payment</h.Custom>
                  <h.Custom>Rate</h.Custom>
                </>
              )}
            </PositionsTable.Header>
          }
          body={null}
        />
        <div css={$.emptyState}>
          <span css={$.emptyStateText}>No funding history yet</span>
        </div>
      </div>

      <div css={$.mobileView}>
        <div css={$.emptyState}>
          <span css={$.emptyStateText}>No funding history yet</span>
        </div>
      </div>
    </>
  );
};
