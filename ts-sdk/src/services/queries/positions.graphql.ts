export const GET_CLOSED_POSITIONS = `
  query GetClosedPositions(
    $account: String!
    $limit: Int!
    $offset: Int!
    $dateFrom: Int
    $dateTo: Int
    $asset: String
    $isLong: Boolean
  ) {
    positions(
      where: {
        positionKey: { 
          account_eq: $account
          indexAssetId_eq: $asset
          isLong_eq: $isLong
        }
        timestamp_gte: $dateFrom
        timestamp_lte: $dateTo
        change_in: [CLOSE, LIQUIDATE]
      }
      limit: $limit
      offset: $offset
      orderBy: timestamp_DESC
    ) {
      id
      positionKey {
        id
        account
        indexAssetId
        isLong
      }
      size
      collateralAmout
      timestamp
      latest
      change
      collateralTransferred
      positionFee
      fundingRate
      pnlDelta
      realizedFundingRate
      realizedPnl
    }
  }
`;

export const GET_POSITION_HISTORY = `
  query GetPositionHistory($positionKeyId: String!) {
    positions(
      where: { 
        positionKey: { 
          id_eq: $positionKeyId 
        } 
      }
      orderBy: timestamp_ASC
    ) {
      id
      positionKey {
        id
        account
        indexAssetId
        isLong
      }
      size
      collateralAmout
      timestamp
      latest
      change
      collateralTransferred
      positionFee
      fundingRate
      pnlDelta
      realizedFundingRate
      realizedPnl
    }
  }
`;

export const GET_ACCOUNT_POSITIONS = `
  query GetAccountPositions(
    $account: String!
    $limit: Int
    $offset: Int
  ) {
    positions(
      where: {
        positionKey: { 
          account_eq: $account
        }
      }
      limit: $limit
      offset: $offset
      orderBy: timestamp_ASC
    ) {
      id
      positionKey {
        id
        account
        indexAssetId
        isLong
      }
      size
      collateralAmout
      timestamp
      latest
      change
      collateralTransferred
      positionFee
      fundingRate
      pnlDelta
      realizedFundingRate
      realizedPnl
    }
  }
`;

export const GET_CLOSED_POSITIONS_COUNT = `
  query GetClosedPositionsCount(
    $account: String!
    $dateFrom: Int
    $dateTo: Int
    $asset: String
    $isLong: Boolean
  ) {
    positions(
      where: {
        positionKey: { 
          account_eq: $account
          indexAssetId_eq: $asset
          isLong_eq: $isLong
        }
        timestamp_gte: $dateFrom
        timestamp_lte: $dateTo
        change_in: [CLOSE, LIQUIDATE]
      }
    ) {
      id
    }
  }
`;

export const GET_POSITION_KEYS = `
  query GetPositionKeys($account: String!) {
    positionKeys(
      where: { 
        account_eq: $account 
      }
    ) {
      id
      account
      indexAssetId
      isLong
    }
  }
`;
