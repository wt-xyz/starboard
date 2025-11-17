import { DataSource, Repository } from 'typeorm';
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
  IndexerPerpetualMarketResponseObject,
  IndexerPerpetualMarketStatus,
  IndexerPerpetualPositionResponse,
  IndexerPerpetualPositionResponseObject,
  IndexerPerpetualPositionStatus,
  IndexerSubaccountResponseObject,
  IndexerTimeResponse,
  IndexerTradeResponse,
  IndexerTradeResponseObject,
  IndexerTradeType,
  IndexerTransferBetweenResponse,
  IndexerTransferResponse,
  IndexerVaultsHistoricalPnlResponse
} from '../../../../src/types/indexer/indexerApiGen';
import {
  IndexerCompositeOrderObject,
  IndexerSparklineResponseObject,
} from '../../../../src/types/indexer/indexerManual';
import { AppDataSource, initializeDatabase } from '../db/data-source';
import { Account } from '../model/generated/account.model';
import { Asset } from '../model/generated/asset.model';
import { Market } from '../model/generated/market.model';
import { Payment } from '../model/generated/payment.model';
import { Position } from '../model/generated/position.model';
import { Trade } from '../model/generated/trade.model';
import { MockDataProvider } from './MockDataProvider.interface';

/**
 * Database-backed mock data provider.
 * Reads from PostgreSQL via TypeORM for persistent, stateful mocks.
 * 
 * IMPLEMENTED (Queries from seed data):
 * ✅ getPerpetualMarkets() - 4 markets (ETH, BTC, SOL, FUEL)
 * ✅ getPerpetualMarketTrades() - 200 trades across markets
 * ✅ getAddressOverview() - Account summaries
 * ✅ getSubaccount() - Individual subaccount data
 * ✅ getPerpetualPositions() - 24 positions with full filtering
 * 
 * STUBBED (Not in seed data, returns empty):
 * - Orderbook, Candles, Sparklines (dynamic/derived data)
 * - Orders, Transfers, Payments, Rewards (not persisted)
 * - Compliance, Vault, Height endpoints
 * 
 * Requires:
 * 1. PostgreSQL running via docker-compose
 * 2. Database seeded: `pnpm seed:reset`
 * 3. MOCK_DATA_SOURCE=database environment variable
 */
export class DatabaseMockProvider implements MockDataProvider {
  private dataSource: DataSource;
  private marketRepo: Repository<Market>;
  private accountRepo: Repository<Account>;
  private positionRepo: Repository<Position>;
  private tradeRepo: Repository<Trade>;
  private paymentRepo: Repository<Payment>;
  private assetRepo: Repository<Asset>;
  private isInitialized = false;

  constructor() {
    this.dataSource = AppDataSource;
    
    // Initialize repositories (will be properly set after connection)
    this.marketRepo = {} as Repository<Market>;
    this.accountRepo = {} as Repository<Account>;
    this.positionRepo = {} as Repository<Position>;
    this.tradeRepo = {} as Repository<Trade>;
    this.paymentRepo = {} as Repository<Payment>;
    this.assetRepo = {} as Repository<Asset>;
  }

  /**
   * Initialize database connection and repositories.
   * Must be called before using any provider methods.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[DatabaseMockProvider] Initializing database connection...');
    
    try {
      await initializeDatabase();
      
      // Initialize repositories
      this.marketRepo = this.dataSource.getRepository(Market);
      this.accountRepo = this.dataSource.getRepository(Account);
      this.positionRepo = this.dataSource.getRepository(Position);
      this.tradeRepo = this.dataSource.getRepository(Trade);
      this.paymentRepo = this.dataSource.getRepository(Payment);
      this.assetRepo = this.dataSource.getRepository(Asset);
      
      this.isInitialized = true;
      console.log('[DatabaseMockProvider] ✓ Database provider ready');
    } catch (error) {
      console.error('[DatabaseMockProvider] ✗ Failed to initialize:', error);
      throw new Error(
        'DatabaseMockProvider initialization failed. ' +
        'Please ensure PostgreSQL is running (docker-compose up -d) ' +
        'and the database has been seeded (pnpm seed:reset)'
      );
    }
  }

  /**
   * Close database connection gracefully.
   */
  async close(): Promise<void> {
    if (this.isInitialized && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.isInitialized = false;
      console.log('[DatabaseMockProvider] Connection closed');
    }
  }

  /**
   * Ensure database is initialized before queries.
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        'DatabaseMockProvider not initialized. Call initialize() first.'
      );
    }
  }

  async getPerpetualMarkets(ticker?: string): Promise<IndexerPerpetualMarketResponse> {
    this.ensureInitialized();
    
    let query = this.marketRepo.createQueryBuilder('market');
    
    if (ticker) {
      query = query.where('market.ticker = :ticker', { ticker });
    }
    
    const markets = await query.getMany();
    
    const marketsObj = markets.reduce<Record<string, IndexerPerpetualMarketResponseObject>>((acc, market) => {
      acc[market.ticker] = {
        clobPairId: market.clobPairId?.toString() || '1',
        ticker: market.ticker,
        status: IndexerPerpetualMarketStatus.ACTIVE,
        oraclePrice: market.oraclePrice?.toString() || '0',
        priceChange24H: market.priceChange24H?.toString() || '0',
        volume24H: market.volume24H?.toString() || '0',
        trades24H: Number(market.trades24H) || 0,
        nextFundingRate: market.nextFundingRate?.toString() || '0',
        initialMarginFraction: market.initialMarginFraction?.toString() || '0.05',
        maintenanceMarginFraction: market.maintenanceMarginFraction?.toString() || '0.03',
        openInterest: market.openInterest?.toString() || '0',
        baseOpenInterest: market.openInterest?.toString() || '0',
        atomicResolution: -6,
        quantumConversionExponent: -9,
        tickSize: market.tickSize?.toString() || '0.01',
        stepSize: market.stepSize?.toString() || '0.001',
        stepBaseQuantums: 1000,
        subticksPerTick: 1000,
        marketType: IndexerPerpetualMarketStatus.ACTIVE as any, // Fix type mismatch
      };
      return acc;
    }, {});
    
    return { markets: marketsObj };
  }

  getPerpetualMarketOrderbook(ticker: string): IndexerOrderbookResponseObject {
    // Orderbook data is not persisted in database, return empty
    return { bids: [], asks: [] };
  }

  async getPerpetualMarketTrades(
    ticker: string,
    limit?: number | null,
    page?: number | null,
    createdBeforeOrAt?: string | null
  ): Promise<IndexerTradeResponse> {
    this.ensureInitialized();
    
    let query = this.tradeRepo
      .createQueryBuilder('trade')
      .leftJoinAndSelect('trade.market', 'market')
      .where('market.ticker = :ticker', { ticker });
    
    if (createdBeforeOrAt) {
      query = query.andWhere('trade.createdAt <= :date', { date: new Date(createdBeforeOrAt) });
    }
    
    query = query.orderBy('trade.createdAt', 'DESC');
    
    const pageSize = limit ?? 100;
    const pageNumber = page ?? 1;
    const offset = (pageNumber - 1) * pageSize;
    
    const [trades, totalResults] = await query
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();
    
    const tradesResponse: IndexerTradeResponseObject[] = trades.map(trade => ({
      id: trade.id,
      side: (trade.side || 'BUY') as any, // Database enum -> API enum
      size: trade.size?.toString() || '0',
      price: trade.price?.toString() || '0',
      type: IndexerTradeType.LIMIT,
      createdAt: trade.createdAt?.toISOString() || new Date().toISOString(),
      createdAtHeight: trade.createdAtHeight.toString(),
    }));
    
    return {
      trades: tradesResponse,
      pageSize,
      offset,
      totalResults,
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

  async getAddressOverview(address: string): Promise<IndexerAddressResponse> {
    this.ensureInitialized();
    
    const accounts = await this.accountRepo.find({
      where: { address: address.toLowerCase() },
    });
    
    const subaccounts: IndexerSubaccountResponseObject[] = accounts.map(account => ({
      address: account.address!,
      subaccountNumber: account.subaccountNumber!,
      equity: '10000', // Calculated field, not persisted
      freeCollateral: '8000', // Calculated field, not persisted
      openPerpetualPositions: {},
      assetPositions: {},
      marginEnabled: true,
      updatedAtHeight: '0',
      latestProcessedBlockHeight: '0',
    }));
    
    return {
      subaccounts,
      totalTradingRewards: '0',
    };
  }

  async getSubaccount(address: string, subaccountNumber: number) {
    this.ensureInitialized();
    
    const account = await this.accountRepo.findOne({
      where: {
        address: address.toLowerCase(),
        subaccountNumber,
      },
    });
    
    return {
      subaccount: {
        address: account?.address || address,
        subaccountNumber,
        equity: '10000', // Calculated field, not persisted
        freeCollateral: '8000', // Calculated field, not persisted
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

  async getPerpetualPositions(
    address: string,
    subaccountNumber?: number | null,
    status?: IndexerPerpetualPositionStatus | null,
    createdBeforeOrAt?: string | null,
    limit?: number | null
  ): Promise<IndexerPerpetualPositionResponse> {
    this.ensureInitialized();
    
    let query = this.positionRepo
      .createQueryBuilder('position')
      .leftJoinAndSelect('position.account', 'account')
      .leftJoinAndSelect('position.market', 'market')
      .where('account.address = :address', { address: address.toLowerCase() });
    
    if (subaccountNumber != null) {
      query = query.andWhere('account.subaccountNumber = :subaccountNumber', { subaccountNumber });
    }
    
    if (status) {
      query = query.andWhere('position.status = :status', { status });
    }
    
    if (createdBeforeOrAt) {
      query = query.andWhere('position.createdAt <= :date', { date: new Date(createdBeforeOrAt) });
    }
    
    if (limit) {
      query = query.take(limit);
    }
    
    const positions = await query.getMany();
    
    const positionsResponse: IndexerPerpetualPositionResponseObject[] = positions.map(position => ({
      market: position.market?.ticker || '',
      status: (position.status || 'OPEN') as any, // Database enum -> API enum
      side: (position.side || 'LONG') as any, // Database enum -> API enum
      size: position.size?.toString() || '0',
      maxSize: position.maxSize?.toString() || '0',
      entryPrice: position.entryPrice?.toString() || '0',
      exitPrice: position.exitPrice?.toString() || null,
      realizedPnl: position.realizedPnl?.toString() || '0',
      unrealizedPnl: position.unrealizedPnl?.toString() || '0',
      createdAt: position.createdAt?.toISOString() || new Date().toISOString(),
      createdAtHeight: position.createdAtHeight?.toString() || '0',
      closedAt: position.closedAt?.toISOString() || null,
      sumOpen: position.size?.toString() || '0',
      sumClose: '0',
      netFunding: '0',
      subaccountNumber: position.account?.subaccountNumber || 0,
    }));
    
    return { positions: positionsResponse };
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


