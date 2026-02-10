import { gql } from 'graphql-request';

export const POSITION_KEYS_LIMIT = 500;
export const POSITIONS_PER_KEY_LIMIT = 500;

export const GET_POSITIONS_BY_ACCOUNT_QUERY = gql`
  query GetPositionsByAccount($account: String!, $firstKeys: Int!, $firstPositions: Int!) {
    positionKeys(condition: { account: $account }, first: $firstKeys) {
      nodes {
        id
        account
        indexAssetId
        isLong
        positions(orderBy: TIMESTAMP_DESC, first: $firstPositions) {
          nodes {
            id
            timestamp
            latest
            change
            collateralDelta
            sizeDelta
            pnlDelta
            outLiquidityFee
            outProtocolFee
            outLiquidationFee
            size
            collateral
            realizedPnl
            outAveragePrice
          }
        }
      }
    }
  }
`;
