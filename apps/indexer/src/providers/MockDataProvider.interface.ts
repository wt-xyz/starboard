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

/**
 * Unified interface for mock data providers.
 * Implementations can be in-memory (fast, stateless) or database-backed (persistent).
 */
export interface MockDataProvider {
  // Market data
  getPerpetualMarkets(ticker?: string): IndexerPerpetualMarketResponse;
  getPerpetualMarketOrderbook(ticker: string): IndexerOrderbookResponseObject;
  getPerpetualMarketTrades(
    ticker: string,
    limit?: number | null,
    page?: number | null,
    createdBeforeOrAt?: string | null
  ): IndexerTradeResponse;
  getPerpetualMarketCandles(
    ticker: string,
    resolution: IndexerCandleResolution,
    limit?: number | null,
    fromISO?: string | null,
    toISO?: string | null
  ): IndexerCandleResponse;
  getPerpetualMarketHistoricalFunding(
    ticker?: string,
    limit?: number | null,
    effectiveBeforeOrAt?: string | null
  ): IndexerHistoricalFundingResponse;
  getSparklines(): IndexerSparklineResponseObject;

  // Account data
  getAddressOverview(address: string): IndexerAddressResponse;
  getSubaccount(address: string, subaccountNumber: number): { subaccount: any };
  getParentSubaccount(address: string, parentSubaccountNumber: number): IndexerParentSubaccountResponse;

  // Positions
  getPerpetualPositions(
    address: string,
    subaccountNumber?: number | null,
    status?: IndexerPerpetualPositionStatus | null,
    createdBeforeOrAt?: string | null,
    limit?: number | null
  ): IndexerPerpetualPositionResponse;
  getAssetPositions(
    address: string,
    subaccountNumber?: number | null,
    limit?: number | null
  ): IndexerAssetPositionResponse;

  // Orders
  getSubaccountOrders(address: string, subaccountNumber: number): IndexerOrderResponseObject[];
  getParentSubaccountOrders(address: string, parentSubaccountNumber: number): IndexerCompositeOrderObject[];
  getOrder(orderId: string): IndexerOrderResponseObject | undefined;

  // Fills
  getSubaccountFills(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFillResponse;
  getParentSubaccountFills(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFillResponse;

  // Transfers
  getSubaccountTransfers(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerTransferResponse;
  getParentSubaccountTransfers(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerParentSubaccountTransferResponse;
  getTransfersBetween(
    sourceAddress: string,
    sourceSubaccountNumber: number,
    recipientAddress: string,
    recipientSubaccountNumber: number
  ): IndexerTransferBetweenResponse;

  // Funding payments
  getSubaccountFundingPayments(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFundingPaymentResponse;
  getParentSubaccountFundingPayments(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFundingPaymentResponse;

  // Historical data
  getSubaccountHistoricalPnl(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerHistoricalPnlResponse;
  getParentHistoricalPnl(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerHistoricalPnlResponse;

  // Rewards
  getHistoricalTradingRewards(address: string): IndexerHistoricalTradingRewardAggregationsResponse;
  getHistoricalBlockTradingRewards(address: string): IndexerHistoricalBlockTradingRewardsResponse;

  // Utility
  getTime(): IndexerTimeResponse;
  getHeight(): IndexerHeightResponse;
  screenAddress(address: string): IndexerComplianceResponse;
  complianceScreen(address: string): IndexerComplianceV2Response;

  // Vault data
  getMegavaultHistoricalPnl(): IndexerMegavaultHistoricalPnlResponse;
  getMegavaultPositions(): IndexerMegavaultPositionResponse;
  getVaultHistoricalPnl(): IndexerVaultsHistoricalPnlResponse;
}





