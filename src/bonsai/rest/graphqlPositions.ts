import { IndexerPerpetualPositionStatus, IndexerPositionSide } from '@/types/indexer/indexerApiGen';

import { type RootStore } from '@/state/_store';
import { setGraphqlPositionsRaw } from '@/state/raw';

import { ToBigNumber } from '@/lib/numbers';

import { refreshIndexerQueryOnAccountSocketRefresh } from '../accountRefreshSignal';
import { loadableIdle } from '../lib/loadable';
import { mapLoadableData } from '../lib/mapLoadable';
import { selectParentSubaccountInfo } from '../socketSelectors';
import { MarginMode, PositionUniqueId, SubaccountPosition } from '../types/summaryTypes';
import { createIndexerQueryStoreEffect } from './lib/indexerQueryStoreEffect';
import { queryResultToLoadable } from './lib/queryResultToLoadable';

// GraphQL position data structure from the Squid indexer
interface GraphQLPositionData {
  id: string;
  positionKey: {
    id: string;
    account: string;
    indexAssetId: string;
    isLong: boolean;
  };
  collateralAmout: string;
  size: string;
  timestamp: number;
  latest: boolean;
  change: 'INCREASE' | 'DECREASE' | 'CLOSE' | 'LIQUIDATE';
  collateralTransferred: string;
  positionFee: string;
  fundingRate: string;
  pnlDelta: string;
  realizedFundingRate: string;
  realizedPnl: string;
}

/**
 * Transform GraphQL position data to SubaccountPosition format
 * Note: This creates a simplified position with mock/calculated values for fields
 * that are not available in the GraphQL data
 */
function transformGraphQLPositionToSubaccountPosition(
  gqlPosition: GraphQLPositionData,
  subaccountNumber: number = 0
): Partial<SubaccountPosition> {
  const side = gqlPosition.positionKey.isLong
    ? IndexerPositionSide.LONG
    : IndexerPositionSide.SHORT;

  // Convert size to signed based on side
  const rawSize = ToBigNumber(gqlPosition.size).dividedBy(1_000_000); // Assuming 6 decimals
  const signedSize = side === IndexerPositionSide.SHORT ? rawSize.negated() : rawSize;

  // Mock values for required fields that aren't in GraphQL data
  // In a real implementation, you'd calculate these based on market data
  const mockEntryPrice = ToBigNumber(50000); // Mock BTC price
  const mockOraclePrice = ToBigNumber(51000);
  const notional = rawSize.abs().multipliedBy(mockEntryPrice);
  const unrealizedPnl = rawSize.multipliedBy(mockOraclePrice.minus(mockEntryPrice));

  const assetIdHex = gqlPosition.positionKey.indexAssetId;
  const assetMatch = assetIdHex.match(/0x([a-z]+)/i);
  const asset = assetMatch?.[1]?.toUpperCase() ?? 'UNKNOWN';
  const marketId = `${asset}-USD`;

  const uniqueId =
    `${gqlPosition.positionKey.account}-${marketId}-${subaccountNumber}` as PositionUniqueId;

  return {
    // Base fields from IndexerPerpetualPositionResponseObject
    id: gqlPosition.id,
    address: gqlPosition.positionKey.account,
    subaccountNumber,
    market: marketId, // Use properly formatted market ID
    side,
    status: gqlPosition.latest
      ? IndexerPerpetualPositionStatus.OPEN
      : IndexerPerpetualPositionStatus.CLOSED,

    // Derived core fields
    uniqueId,
    assetId: asset, // Use clean asset ID
    marginMode: 'CROSS' as MarginMode, // Assume CROSS margin for GraphQL positions
    signedSize,
    unsignedSize: rawSize.abs(),
    notional,
    value: notional,

    // Price fields
    entryPrice: mockEntryPrice,
    baseEntryPrice: mockEntryPrice,
    exitPrice: gqlPosition.latest ? undefined : mockOraclePrice,

    // PnL and funding
    realizedPnl: ToBigNumber(gqlPosition.realizedPnl).dividedBy(1_000_000),
    unrealizedPnl,
    updatedUnrealizedPnl: unrealizedPnl,
    updatedUnrealizedPnlPercent: unrealizedPnl.dividedBy(notional).multipliedBy(100),
    netFunding: ToBigNumber(gqlPosition.fundingRate).dividedBy(1_000_000),
    baseNetFunding: ToBigNumber(gqlPosition.realizedFundingRate).dividedBy(1_000_000),

    // Size tracking
    maxSize: rawSize,
    sumOpen: ToBigNumber(0),
    sumClose: ToBigNumber(0),

    // Timestamps
    createdAt: new Date(gqlPosition.timestamp * 1000).toISOString(),
    createdAtHeight: ToBigNumber(0),
    closedAt: gqlPosition.latest ? null : new Date(gqlPosition.timestamp * 1000).toISOString(),

    // Risk parameters (simplified/mocked)
    adjustedImf: ToBigNumber(0.1), // 10% initial margin
    adjustedMmf: ToBigNumber(0.05), // 5% maintenance margin
    initialRisk: notional.multipliedBy(0.1),
    maintenanceRisk: notional.multipliedBy(0.05),
    maxLeverage: ToBigNumber(10),

    // Margin values (simplified)
    marginValueInitial: ToBigNumber(gqlPosition.collateralAmout).dividedBy(1_000_000),
    marginValueMaintenance: ToBigNumber(gqlPosition.collateralAmout)
      .dividedBy(1_000_000)
      .multipliedBy(0.5),
    liquidationPrice: null, // Would need market data to calculate

    // Leverage
    leverage: notional.dividedBy(ToBigNumber(gqlPosition.collateralAmout).dividedBy(1_000_000)),

    // Resources (for reference)
    resources: {
      sizeTotal: rawSize,
      sideString: side,
      entryPriceString: mockEntryPrice.toString(),
    },
  } as Partial<SubaccountPosition>;
}

/**
 * Set up the GraphQL positions query that fetches positions from the Squid indexer
 * and transforms them into the SubaccountPosition format
 */
export function setUpGraphQLPositionsQuery(store: RootStore) {
  const cleanupListener = refreshIndexerQueryOnAccountSocketRefresh([
    'account',
    'graphqlPositions',
  ]);

  const cleanupEffect = createIndexerQueryStoreEffect(store, {
    name: 'graphqlPositions',
    selector: selectParentSubaccountInfo,
    getQueryKey: (data) => ['account', 'graphqlPositions', data.wallet],
    getQueryFn: (indexerClient, data) => {
      const positionsClient = (indexerClient as any).positions;

      return async () => {
        try {
          const positions = await positionsClient.getLatestPositionsByAccount(data.wallet!);
          return positions;
        } catch (error) {
          // Failed to fetch GraphQL positions
          return [];
        }
      };
    },
    onResult: (positions) => {
      store.dispatch(
        setGraphqlPositionsRaw(
          mapLoadableData(queryResultToLoadable(positions), (data) =>
            data.map((gqlPos: GraphQLPositionData) =>
              transformGraphQLPositionToSubaccountPosition(gqlPos, 0)
            )
          )
        )
      );
    },
    onNoQuery: () => store.dispatch(setGraphqlPositionsRaw(loadableIdle())),
  });

  return () => {
    cleanupListener();
    cleanupEffect();
    store.dispatch(setGraphqlPositionsRaw(loadableIdle()));
  };
}
