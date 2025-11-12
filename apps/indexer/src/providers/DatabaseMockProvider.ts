import {
  IndexerAddressResponse,
  IndexerAssetPositionResponse,
  IndexerCandleResolution,
  IndexerCandleResponse,
  IndexerComplianceResponse,
  IndexerComplianceV2Response,
  IndexerFillResponse,
  IndexerFundingPaymentResponse,
  IndexerHeightResponse,
  IndexerHistoricalBlockTradingRewardsResponse,
  IndexerHistoricalFundingResponse,
  IndexerHistoricalPnlResponse,
  IndexerHistoricalTradingRewardAggregationsResponse,
  IndexerMegavaultHistoricalPnlResponse,
  IndexerMegavaultPositionResponse,
  IndexerOrderResponseObject,
  IndexerOrderbookResponseObject,
  IndexerParentSubaccountResponse,
  IndexerParentSubaccountTransferResponse,
  IndexerPerpetualMarketResponse,
  IndexerPerpetualPositionResponse,
  IndexerPerpetualPositionStatus,
  IndexerTimeResponse,
  IndexerTradeResponse,
  IndexerTransferBetweenResponse,
  IndexerTransferResponse,
  IndexerVaultsHistoricalPnlResponse,
} from '../../../../src/types/indexer/indexerApiGen';
import {
  IndexerCompositeOrderObject,
  IndexerSparklineResponseObject,
} from '../../../../src/types/indexer/indexerManual';
import { MockDataProvider } from './MockDataProvider.interface';

/**
 * Database-backed mock data provider.
 * Reads from PostgreSQL via TypeORM for persistent, stateful mocks.
 * 
 * TODO: Implement TypeORM queries once seed scripts are ready.
 * For now, this is a placeholder that returns empty/minimal data.
 */
export class DatabaseMockProvider implements MockDataProvider {
  constructor() {
    // TODO: Initialize TypeORM connection
    console.log('[DatabaseMockProvider] Database mode not yet implemented. Returning empty data.');
  }

  getPerpetualMarkets(ticker?: string): IndexerPerpetualMarketResponse {
    // TODO: Query Market entities from database
    return { markets: {} };
  }

  getPerpetualMarketOrderbook(ticker: string): IndexerOrderbookResponseObject {
    // TODO: Query orderbook data
    return { bids: [], asks: [] };
  }

  getPerpetualMarketTrades(
    ticker: string,
    limit?: number | null,
    page?: number | null,
    createdBeforeOrAt?: string | null
  ): IndexerTradeResponse {
    // TODO: Query Trade entities
    return {
      trades: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getPerpetualMarketCandles(
    ticker: string,
    resolution: IndexerCandleResolution,
    limit?: number | null,
    fromISO?: string | null,
    toISO?: string | null
  ): IndexerCandleResponse {
    // TODO: Query Candle entities
    return { candles: [] };
  }

  getPerpetualMarketHistoricalFunding(
    ticker?: string,
    limit?: number | null,
    effectiveBeforeOrAt?: string | null
  ): IndexerHistoricalFundingResponse {
    // TODO: Query funding history
    return { historicalFunding: [] };
  }

  getSparklines(): IndexerSparklineResponseObject {
    // TODO: Generate sparklines from candle data
    return {};
  }

  getAddressOverview(address: string): IndexerAddressResponse {
    // TODO: Query Account entities
    return {
      subaccounts: [],
      totalTradingRewards: '0',
    };
  }

  getSubaccount(address: string, subaccountNumber: number) {
    // TODO: Query specific subaccount
    return {
      subaccount: {
        address,
        subaccountNumber,
        equity: '0',
        freeCollateral: '0',
        openPerpetualPositions: {},
        assetPositions: {},
        marginEnabled: true,
        updatedAtHeight: '0',
        latestProcessedBlockHeight: '0',
      },
    };
  }

  getParentSubaccount(address: string, parentSubaccountNumber: number): IndexerParentSubaccountResponse {
    // TODO: Query parent subaccount with children
    return {
      address,
      parentSubaccountNumber,
      equity: '0',
      freeCollateral: '0',
      childSubaccounts: [],
    };
  }

  getPerpetualPositions(
    address: string,
    subaccountNumber?: number | null,
    status?: IndexerPerpetualPositionStatus | null,
    createdBeforeOrAt?: string | null,
    limit?: number | null
  ): IndexerPerpetualPositionResponse {
    // TODO: Query Position entities
    return { positions: [] };
  }

  getAssetPositions(
    address: string,
    subaccountNumber?: number | null,
    limit?: number | null
  ): IndexerAssetPositionResponse {
    // TODO: Query asset positions
    return { positions: [] };
  }

  getSubaccountOrders(address: string, subaccountNumber: number): IndexerOrderResponseObject[] {
    // TODO: Query orders
    return [];
  }

  getParentSubaccountOrders(address: string, parentSubaccountNumber: number): IndexerCompositeOrderObject[] {
    // TODO: Query composite orders
    return [];
  }

  getOrder(orderId: string): IndexerOrderResponseObject | undefined {
    // TODO: Query single order by ID
    return undefined;
  }

  getSubaccountFills(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFillResponse {
    // TODO: Query fills
    return {
      fills: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getParentSubaccountFills(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFillResponse {
    // TODO: Query fills for parent
    return {
      fills: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getSubaccountTransfers(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerTransferResponse {
    // TODO: Query transfers
    return {
      transfers: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getParentSubaccountTransfers(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerParentSubaccountTransferResponse {
    // TODO: Query transfers for parent
    return {
      transfers: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getTransfersBetween(
    sourceAddress: string,
    sourceSubaccountNumber: number,
    recipientAddress: string,
    recipientSubaccountNumber: number
  ): IndexerTransferBetweenResponse {
    // TODO: Query transfers between accounts
    return {
      transfersSubset: [],
      totalResults: 0,
      pageSize: 0,
      offset: 0,
      totalNetTransfers: '0',
    };
  }

  getSubaccountFundingPayments(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFundingPaymentResponse {
    // TODO: Query funding payments
    return {
      fundingPayments: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getParentSubaccountFundingPayments(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFundingPaymentResponse {
    // TODO: Query funding payments for parent
    return {
      fundingPayments: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getSubaccountHistoricalPnl(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerHistoricalPnlResponse {
    // TODO: Query historical PnL
    return {
      historicalPnl: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getParentHistoricalPnl(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerHistoricalPnlResponse {
    // TODO: Query historical PnL for parent
    return {
      historicalPnl: [],
      pageSize: 0,
      offset: 0,
      totalResults: 0,
    };
  }

  getHistoricalTradingRewards(address: string): IndexerHistoricalTradingRewardAggregationsResponse {
    // TODO: Query trading rewards
    return { rewards: [] };
  }

  getHistoricalBlockTradingRewards(address: string): IndexerHistoricalBlockTradingRewardsResponse {
    // TODO: Query block rewards
    return { rewards: [] };
  }

  getTime(): IndexerTimeResponse {
    const now = Date.now();
    return {
      iso: new Date(now).toISOString(),
      epoch: Math.floor(now / 1000),
    };
  }

  getHeight(): IndexerHeightResponse {
    // TODO: Query actual blockchain height
    const now = Date.now();
    return {
      height: '12500000',
      time: new Date(now).toISOString(),
    };
  }

  screenAddress(address: string): IndexerComplianceResponse {
    // TODO: Implement compliance screening
    return {
      restricted: false,
    };
  }

  complianceScreen(address: string): IndexerComplianceV2Response {
    // TODO: Implement compliance screening
    return {
      status: 'COMPLIANT' as any,
      updatedAt: new Date().toISOString(),
    };
  }

  getMegavaultHistoricalPnl(): IndexerMegavaultHistoricalPnlResponse {
    // TODO: Query megavault PnL
    return { megavaultPnl: [] };
  }

  getMegavaultPositions(): IndexerMegavaultPositionResponse {
    // TODO: Query megavault positions
    return { positions: [] };
  }

  getVaultHistoricalPnl(): IndexerVaultsHistoricalPnlResponse {
    // TODO: Query vault PnL
    return { vaultsPnl: [] };
  }
}

