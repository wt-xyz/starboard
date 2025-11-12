import {
  IndexerAddressResponse,
  IndexerAssetPositionResponse,
  IndexerAssetPositionResponseObject,
  IndexerCandleResolution,
  IndexerCandleResponse,
  IndexerCandleResponseObject,
  IndexerComplianceReason,
  IndexerComplianceResponse,
  IndexerComplianceStatus,
  IndexerComplianceV2Response,
  IndexerFillResponse,
  IndexerFillResponseObject,
  IndexerFillType,
  IndexerFundingPaymentResponse,
  IndexerFundingPaymentResponseObject,
  IndexerHeightResponse,
  IndexerHistoricalBlockTradingReward,
  IndexerHistoricalBlockTradingRewardsResponse,
  IndexerHistoricalFundingResponse,
  IndexerHistoricalFundingResponseObject,
  IndexerHistoricalPnlResponse,
  IndexerHistoricalTradingRewardAggregation,
  IndexerHistoricalTradingRewardAggregationsResponse,
  IndexerLiquidity,
  IndexerMarketType,
  IndexerMegavaultHistoricalPnlResponse,
  IndexerMegavaultPositionResponse,
  IndexerOrderResponseObject,
  IndexerOrderSide,
  IndexerOrderType,
  IndexerOrderbookResponseObject,
  IndexerParentSubaccountResponse,
  IndexerParentSubaccountTransferResponse,
  IndexerPerpetualMarketResponse,
  IndexerPerpetualMarketResponseObject,
  IndexerPerpetualMarketStatus,
  IndexerPerpetualMarketType,
  IndexerPerpetualPositionResponse,
  IndexerPerpetualPositionResponseObject,
  IndexerPerpetualPositionStatus,
  IndexerPnlTicksResponseObject,
  IndexerPositionSide,
  IndexerSubaccountResponseObject,
  IndexerTimeResponse,
  IndexerTradeResponse,
  IndexerTradeResponseObject,
  IndexerTradeType,
  IndexerTradingRewardAggregationPeriod,
  IndexerTransferBetweenResponse,
  IndexerTransferResponse,
  IndexerTransferResponseObject,
  IndexerTransferResponseObjectSender,
  IndexerTransferType,
  IndexerVaultHistoricalPnl,
  IndexerVaultPosition,
  IndexerVaultsHistoricalPnlResponse,
  IndexerAPITimeInForce,
  IndexerOrderStatus,
  IndexerBestEffortOpenedStatus,
} from '../../../src/types/indexer/indexerApiGen';
import {
  IndexerCompositeFillObject,
  IndexerCompositeOrderObject,
  IndexerSparklineResponseObject,
} from '../../../src/types/indexer/indexerManual';

type SubaccountBundle = {
  subaccount: IndexerSubaccountResponseObject;
  parentSubaccountNumber: number;
  positions: IndexerPerpetualPositionResponseObject[];
  assetPositions: IndexerAssetPositionResponseObject[];
  orders: IndexerOrderResponseObject[];
  compositeOrders: IndexerCompositeOrderObject[];
  fills: IndexerCompositeFillObject[];
  transfers: IndexerTransferResponseObject[];
  fundingPayments: IndexerFundingPaymentResponseObject[];
  historicalPnl: IndexerPnlTicksResponseObject[];
  tradingRewards: IndexerHistoricalTradingRewardAggregation[];
  blockRewards: IndexerHistoricalBlockTradingReward[];
};

type MarketsSpec = {
  ticker: string;
  clobPairId: string;
  basePrice: number;
  priceVariance: number;
  baseVolume: number;
};

const MARKET_SPECS: MarketsSpec[] = [
  { ticker: 'ETH-USD', clobPairId: '1', basePrice: 3200.42, priceVariance: 120.33, baseVolume: 250_000_000_000 },
  { ticker: 'BTC-USD', clobPairId: '2', basePrice: 62050.12, priceVariance: 980.45, baseVolume: 480_000_000_000 },
  { ticker: 'SOL-USD', clobPairId: '3', basePrice: 185.37, priceVariance: 18.55, baseVolume: 125_000_000_000 },
];

const CANDLE_CONFIG: { resolution: IndexerCandleResolution; minutes: number }[] = [
  { resolution: IndexerCandleResolution._1MIN, minutes: 1 },
  { resolution: IndexerCandleResolution._5MINS, minutes: 5 },
  { resolution: IndexerCandleResolution._15MINS, minutes: 15 },
  { resolution: IndexerCandleResolution._30MINS, minutes: 30 },
  { resolution: IndexerCandleResolution._1HOUR, minutes: 60 },
  { resolution: IndexerCandleResolution._4HOURS, minutes: 240 },
  { resolution: IndexerCandleResolution._1DAY, minutes: 1440 },
];

const ONE_MINUTE_MS = 60 * 1000;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function randomInt(seed: string, min: number, max: number): number {
  const hashed = hashSeed(seed);
  return min + (hashed % (max - min + 1));
}

function randomAmount(seed: string, min: number, max: number, decimals = 2): string {
  const value = min + (hashSeed(seed) % (max - min));
  return value.toFixed(decimals);
}

function randomBig(seed: string, min: number, max: number): string {
  const value = BigInt(min) + BigInt(hashSeed(seed) % (max - min));
  return value.toString();
}

function isoMinutesAgo(base: number, minutes: number): string {
  return new Date(base - minutes * ONE_MINUTE_MS).toISOString();
}

function buildPagination<T>(items: T[], limit?: number | null, page?: number | null) {
  if (!limit || limit <= 0) {
    return {
      pageSize: items.length,
      offset: 0,
      results: items,
      totalResults: items.length,
    };
  }
  const safePage = Math.max(1, page ?? 1);
  const offset = (safePage - 1) * limit;
  return {
    pageSize: limit,
    offset,
    totalResults: items.length,
    results: items.slice(offset, offset + limit),
  };
}

export class MockIndexerService {
  private readonly now = Date.now();

  private readonly markets: IndexerPerpetualMarketResponseObject[];

  private readonly marketsByTicker: Record<string, IndexerPerpetualMarketResponseObject>;

  private readonly orderbooks: Record<string, IndexerOrderbookResponseObject>;

  private readonly candles: Record<string, IndexerCandleResponseObject[]>;

  private readonly trades: Record<string, IndexerTradeResponseObject[]>;

  private readonly fundingHistory: Record<string, IndexerHistoricalFundingResponseObject[]>;

  private readonly sparklines: IndexerSparklineResponseObject;

  private readonly megavaultPositions: IndexerMegavaultPositionResponse;

  private readonly megavaultHistoricalPnl: IndexerMegavaultHistoricalPnlResponse;

  private readonly vaultHistoricalPnl: IndexerVaultsHistoricalPnlResponse;

  private readonly subaccountCache = new Map<string, SubaccountBundle>();

  private readonly orderById = new Map<string, IndexerOrderResponseObject>();

  private readonly compositeOrderById = new Map<string, IndexerCompositeOrderObject>();

  constructor() {
    this.markets = this.createMarketData();
    this.marketsByTicker = Object.fromEntries(this.markets.map((market) => [market.ticker, market]));
    this.orderbooks = this.createOrderbooks();
    this.candles = this.createCandles();
    this.trades = this.createTrades();
    this.fundingHistory = this.createHistoricalFunding();
    this.sparklines = this.createSparklines();
    this.megavaultPositions = this.createMegavaultPositions();
    this.megavaultHistoricalPnl = this.createMegavaultHistoricalPnl();
    this.vaultHistoricalPnl = this.createVaultHistoricalPnl();
  }

  getPerpetualMarkets(ticker?: string): IndexerPerpetualMarketResponse {
    if (ticker) {
      const market = this.marketsByTicker[ticker];
      return {
        markets: market ? { [ticker]: market } : {},
      };
    }
    return {
      markets: this.markets.reduce<Record<string, IndexerPerpetualMarketResponseObject>>((acc, market) => {
        acc[market.ticker] = market;
        return acc;
      }, {}),
    };
  }

  getPerpetualMarketOrderbook(ticker: string): IndexerOrderbookResponseObject {
    return this.orderbooks[ticker] ?? { bids: [], asks: [] };
  }

  getPerpetualMarketTrades(
    ticker: string,
    limit?: number | null,
    page?: number | null,
    createdBeforeOrAt?: string | null
  ): IndexerTradeResponse {
    const entries = [...(this.trades[ticker] ?? [])];
    let filtered = entries;
    if (createdBeforeOrAt) {
      filtered = entries.filter((trade) => trade.createdAt <= createdBeforeOrAt);
    }
    const { results, pageSize, offset, totalResults } = buildPagination(filtered, limit, page);
    return {
      trades: results,
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
    const entries = (this.candles[ticker] ?? []).filter((candle) => candle.resolution === resolution);
    let filtered = entries;
    if (fromISO) {
      filtered = filtered.filter((candle) => candle.startedAt >= fromISO);
    }
    if (toISO) {
      filtered = filtered.filter((candle) => candle.startedAt <= toISO);
    }
    const { results } = buildPagination(filtered, limit, 1);
    return { candles: results };
  }

  getPerpetualMarketHistoricalFunding(
    ticker?: string,
    limit?: number | null,
    effectiveBeforeOrAt?: string | null
  ): IndexerHistoricalFundingResponse {
    const markets = ticker ? [ticker] : Object.keys(this.marketsByTicker);
    const rows = markets.flatMap((market) => this.fundingHistory[market] ?? []);
    let filtered = rows.sort((a, b) => (a.effectiveAt > b.effectiveAt ? -1 : 1));
    if (effectiveBeforeOrAt) {
      filtered = filtered.filter((item) => item.effectiveAt <= effectiveBeforeOrAt);
    }
    const { results } = buildPagination(filtered, limit, 1);
    return { historicalFunding: results };
  }

  getSparklines(): IndexerSparklineResponseObject {
    return this.sparklines;
  }

  getAddressOverview(address: string): IndexerAddressResponse {
    const normalized = address.toLowerCase();
    const subaccounts = this.childSubaccountNumbers(0).map((subaccountNumber) =>
      this.getOrCreateSubaccountBundle(normalized, subaccountNumber).subaccount
    );
    return {
      subaccounts,
      totalTradingRewards: randomAmount(`${normalized}-rewards`, 250, 950),
    };
  }

  getSubaccount(address: string, subaccountNumber: number) {
    const bundle = this.getOrCreateSubaccountBundle(address.toLowerCase(), subaccountNumber);
    return { subaccount: bundle.subaccount };
  }

  getParentSubaccount(address: string, parentSubaccountNumber: number): IndexerParentSubaccountResponse {
    const normalized = address.toLowerCase();
    const childSubaccounts = this.childSubaccountNumbers(parentSubaccountNumber).map((subaccountNumber) =>
      this.getOrCreateSubaccountBundle(normalized, subaccountNumber).subaccount
    );
    const equitySeed = `${normalized}-parent-${parentSubaccountNumber}`;
    return {
      address: normalized,
      parentSubaccountNumber,
      equity: randomAmount(`${equitySeed}-equity`, 150_000, 350_000, 2),
      freeCollateral: randomAmount(`${equitySeed}-collateral`, 60_000, 140_000, 2),
      childSubaccounts,
    };
  }

  getPerpetualPositions(
    address: string,
    subaccountNumber?: number | null,
    status?: IndexerPerpetualPositionStatus | null,
    createdBeforeOrAt?: string | null,
    limit?: number | null
  ): IndexerPerpetualPositionResponse {
    const normalized = address.toLowerCase();
    const bundles =
      subaccountNumber != null
        ? [this.getOrCreateSubaccountBundle(normalized, subaccountNumber)]
        : this.childSubaccountNumbers(0).map((num) => this.getOrCreateSubaccountBundle(normalized, num));
    let positions = bundles.flatMap((bundle) => bundle.positions);
    if (status) {
      positions = positions.filter((position) => position.status === status);
    }
    if (createdBeforeOrAt) {
      positions = positions.filter((position) => position.createdAt <= createdBeforeOrAt);
    }
    const { results } = buildPagination(positions, limit, 1);
    return { positions: results };
  }

  getAssetPositions(
    address: string,
    subaccountNumber?: number | null,
    limit?: number | null
  ): IndexerAssetPositionResponse {
    const normalized = address.toLowerCase();
    const bundles =
      subaccountNumber != null
        ? [this.getOrCreateSubaccountBundle(normalized, subaccountNumber)]
        : this.childSubaccountNumbers(0).map((num) => this.getOrCreateSubaccountBundle(normalized, num));
    const assets = bundles.flatMap((bundle) => bundle.assetPositions);
    const { results } = buildPagination(assets, limit, 1);
    return { positions: results };
  }

  getSubaccountOrders(address: string, subaccountNumber: number): IndexerOrderResponseObject[] {
    return this.getOrCreateSubaccountBundle(address.toLowerCase(), subaccountNumber).orders;
  }

  getParentSubaccountOrders(address: string, parentSubaccountNumber: number): IndexerCompositeOrderObject[] {
    const normalized = address.toLowerCase();
    return this.childSubaccountNumbers(parentSubaccountNumber)
      .map((num) => this.getOrCreateSubaccountBundle(normalized, num).compositeOrders)
      .flat();
  }

  getOrder(orderId: string): IndexerOrderResponseObject | undefined {
    return this.orderById.get(orderId);
  }

  getSubaccountFills(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFillResponse {
    const fills = this.getOrCreateSubaccountBundle(address.toLowerCase(), subaccountNumber).fills;
    const { results, pageSize, offset, totalResults } = buildPagination(fills, limit, page);
    return {
      fills: results as IndexerFillResponseObject[],
      pageSize,
      offset,
      totalResults,
    };
  }

  getParentSubaccountFills(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFillResponse {
    const normalized = address.toLowerCase();
    const fills = this.childSubaccountNumbers(parentSubaccountNumber)
      .map((num) => this.getOrCreateSubaccountBundle(normalized, num).fills)
      .flat();
    const { results, pageSize, offset, totalResults } = buildPagination(fills, limit, page);
    return {
      fills: results as IndexerFillResponseObject[],
      pageSize,
      offset,
      totalResults,
    };
  }

  getSubaccountTransfers(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerTransferResponse {
    const transfers = this.getOrCreateSubaccountBundle(address.toLowerCase(), subaccountNumber).transfers;
    const { results, pageSize, offset, totalResults } = buildPagination(transfers, limit, page);
    return {
      transfers: results,
      pageSize,
      offset,
      totalResults,
    };
  }

  getParentSubaccountTransfers(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerParentSubaccountTransferResponse {
    const normalized = address.toLowerCase();
    const transfers = this.childSubaccountNumbers(parentSubaccountNumber)
      .map((num) => this.getOrCreateSubaccountBundle(normalized, num).transfers)
      .flat();
    const { results, pageSize, offset, totalResults } = buildPagination(transfers, limit, page);
    return {
      transfers: results,
      pageSize,
      offset,
      totalResults,
    };
  }

  getTransfersBetween(
    sourceAddress: string,
    sourceSubaccountNumber: number,
    recipientAddress: string,
    recipientSubaccountNumber: number
  ): IndexerTransferBetweenResponse {
    const transfer = this.buildTransfer(
      sourceAddress.toLowerCase(),
      sourceSubaccountNumber,
      recipientAddress.toLowerCase(),
      recipientSubaccountNumber,
      'between'
    );
    return {
      transfersSubset: [transfer],
      totalResults: 1,
      pageSize: 1,
      offset: 0,
      totalNetTransfers: transfer.size,
    };
  }

  getSubaccountFundingPayments(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFundingPaymentResponse {
    const payments = this.getOrCreateSubaccountBundle(address.toLowerCase(), subaccountNumber).fundingPayments;
    const { results, pageSize, offset, totalResults } = buildPagination(payments, limit, page);
    return {
      fundingPayments: results,
      pageSize,
      offset,
      totalResults,
    };
  }

  getParentSubaccountFundingPayments(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerFundingPaymentResponse {
    const normalized = address.toLowerCase();
    const payments = this.childSubaccountNumbers(parentSubaccountNumber)
      .map((num) => this.getOrCreateSubaccountBundle(normalized, num).fundingPayments)
      .flat();
    const { results, pageSize, offset, totalResults } = buildPagination(payments, limit, page);
    return {
      fundingPayments: results,
      pageSize,
      offset,
      totalResults,
    };
  }

  getSubaccountHistoricalPnl(
    address: string,
    subaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerHistoricalPnlResponse {
    const pnls = this.getOrCreateSubaccountBundle(address.toLowerCase(), subaccountNumber).historicalPnl;
    const { results, pageSize, offset, totalResults } = buildPagination(pnls, limit, page);
    return {
      historicalPnl: results,
      pageSize,
      offset,
      totalResults,
    };
  }

  getParentHistoricalPnl(
    address: string,
    parentSubaccountNumber: number,
    limit?: number | null,
    page?: number | null
  ): IndexerHistoricalPnlResponse {
    const normalized = address.toLowerCase();
    const pnls = this.childSubaccountNumbers(parentSubaccountNumber)
      .map((num) => this.getOrCreateSubaccountBundle(normalized, num).historicalPnl)
      .flat();
    const sorted = pnls.sort((a, b) => (a.blockTime > b.blockTime ? -1 : 1));
    const { results, pageSize, offset, totalResults } = buildPagination(sorted, limit, page);
    return {
      historicalPnl: results,
      pageSize,
      offset,
      totalResults,
    };
  }

  getHistoricalTradingRewards(address: string): IndexerHistoricalTradingRewardAggregationsResponse {
    const rewards = this.getOrCreateSubaccountBundle(address.toLowerCase(), 0).tradingRewards;
    return { rewards };
  }

  getHistoricalBlockTradingRewards(address: string): IndexerHistoricalBlockTradingRewardsResponse {
    const rewards = this.getOrCreateSubaccountBundle(address.toLowerCase(), 0).blockRewards;
    return { rewards };
  }

  getTime(): IndexerTimeResponse {
    return {
      iso: new Date(this.now).toISOString(),
      epoch: Math.floor(this.now / 1000),
    };
  }

  getHeight(): IndexerHeightResponse {
    const height = 12_500_000 + Math.floor((Date.now() - this.now) / 1000);
    return {
      height: height.toString(),
      time: new Date(this.now).toISOString(),
    };
  }

  screenAddress(address: string): IndexerComplianceResponse {
    const restricted = address.toLowerCase().endsWith('00');
    return {
      restricted,
      reason: restricted ? 'Mock compliance flag' : undefined,
    };
  }

  complianceScreen(address: string): IndexerComplianceV2Response {
    const restricted = address.toLowerCase().endsWith('ff');
    return {
      status: restricted ? IndexerComplianceStatus.FIRSTSTRIKE : IndexerComplianceStatus.COMPLIANT,
      reason: restricted ? IndexerComplianceReason.MANUAL : undefined,
      updatedAt: new Date(this.now - 5 * ONE_MINUTE_MS).toISOString(),
    };
  }

  getMegavaultHistoricalPnl(): IndexerMegavaultHistoricalPnlResponse {
    return this.megavaultHistoricalPnl;
  }

  getMegavaultPositions(): IndexerMegavaultPositionResponse {
    return this.megavaultPositions;
  }

  getVaultHistoricalPnl(): IndexerVaultsHistoricalPnlResponse {
    return this.vaultHistoricalPnl;
  }

  private childSubaccountNumbers(parentSubaccountNumber: number): number[] {
    const base = parentSubaccountNumber * 2;
    return [base, base + 1];
  }

  private getMarketBasePrice(ticker: string): number {
    const spec = MARKET_SPECS.find((s) => s.ticker === ticker);
    return spec?.basePrice ?? Number(this.marketsByTicker[ticker]?.oraclePrice ?? 0);
  }

  private getOrCreateSubaccountBundle(address: string, subaccountNumber: number): SubaccountBundle {
    const key = `${address}-${subaccountNumber}`;
    const existing = this.subaccountCache.get(key);
    if (existing) {
      return existing;
    }
    const bundle = this.buildSubaccountBundle(address, subaccountNumber);
    this.subaccountCache.set(key, bundle);
    bundle.orders.forEach((order) => this.orderById.set(order.id, order));
    bundle.compositeOrders.forEach((order) => {
      if (order.id) {
        this.compositeOrderById.set(order.id, order);
      }
    });
    return bundle;
  }

  private buildSubaccountBundle(address: string, subaccountNumber: number): SubaccountBundle {
    const parentSubaccountNumber = Math.floor(subaccountNumber / 2);
    const positions = this.buildPerpetualPositions(address, subaccountNumber);
    const assetPositions = this.buildAssetPositions(address, subaccountNumber);
    const openPerpetualPositions = positions
      .filter((position) => position.status === IndexerPerpetualPositionStatus.OPEN)
      .reduce<Record<string, IndexerPerpetualPositionResponseObject>>((acc, position) => {
        acc[position.market] = position;
        return acc;
      }, {});
    const assetMap = assetPositions.reduce<Record<string, IndexerAssetPositionResponseObject>>((acc, asset) => {
      acc[asset.symbol] = asset;
      return acc;
    }, {});
    const subaccount: IndexerSubaccountResponseObject = {
      address,
      subaccountNumber,
      equity: randomAmount(`${address}-${subaccountNumber}-equity`, 80_000, 150_000, 2),
      freeCollateral: randomAmount(`${address}-${subaccountNumber}-free`, 40_000, 90_000, 2),
      openPerpetualPositions,
      assetPositions: assetMap,
      marginEnabled: true,
      updatedAtHeight: (1_000_000 + subaccountNumber * 10).toString(),
      latestProcessedBlockHeight: (1_000_500 + subaccountNumber * 10).toString(),
    };
    const orders = this.buildOrders(address, subaccountNumber);
    const compositeOrders = orders.map((order, idx) => this.toCompositeOrder(order, idx));
    const fills = this.buildFills(address, subaccountNumber, orders);
    const transfers = this.buildTransfers(address, subaccountNumber, parentSubaccountNumber);
    const fundingPayments = this.buildFundingPayments(address, subaccountNumber);
    const historicalPnl = this.buildHistoricalPnl(address, subaccountNumber);
    const tradingRewards = this.buildTradingRewards(address, subaccountNumber);
    const blockRewards = this.buildBlockRewards(address, subaccountNumber);
    return {
      subaccount,
      parentSubaccountNumber,
      positions,
      assetPositions,
      orders,
      compositeOrders,
      fills,
      transfers,
      fundingPayments,
      historicalPnl,
      tradingRewards,
      blockRewards,
    };
  }

  private buildPerpetualPositions(address: string, subaccountNumber: number): IndexerPerpetualPositionResponseObject[] {
    return this.markets.slice(0, 2).map((market, idx) => {
      const seed = `${address}-${subaccountNumber}-${market.ticker}-${idx}`;
      const status =
        idx % 2 === 0 ? IndexerPerpetualPositionStatus.OPEN : IndexerPerpetualPositionStatus.CLOSED;
      const createdMinutesAgo = (idx + 1) * 45;
      const basePrice = this.getMarketBasePrice(market.ticker);
      return {
        market: market.ticker,
        status,
        side: idx % 2 === 0 ? IndexerPositionSide.LONG : IndexerPositionSide.SHORT,
        size: randomBig(`${seed}-size`, 5_000_000, 50_000_000),
        maxSize: randomBig(`${seed}-max`, 50_000_000, 150_000_000),
        entryPrice: randomAmount(`${seed}-entry`, basePrice * 0.9, basePrice * 1.1, 2),
        realizedPnl: randomAmount(`${seed}-realized`, 500, 5_000, 2),
        createdAt: isoMinutesAgo(this.now, createdMinutesAgo),
        createdAtHeight: (2_000_000 + subaccountNumber * 50 + idx).toString(),
        sumOpen: randomAmount(`${seed}-sumOpen`, 10_000, 25_000, 4),
        sumClose: randomAmount(`${seed}-sumClose`, 1_000, 4_000, 4),
        netFunding: randomAmount(`${seed}-netFunding`, -100, 100, 4),
        unrealizedPnl: randomAmount(`${seed}-unrealized`, -500, 2_000, 2),
        closedAt: status === IndexerPerpetualPositionStatus.OPEN ? null : isoMinutesAgo(this.now, createdMinutesAgo - 10),
        exitPrice:
          status === IndexerPerpetualPositionStatus.OPEN
            ? null
            : randomAmount(`${seed}-exit`, basePrice * 0.95, basePrice * 1.1, 2),
        subaccountNumber,
      };
    });
  }

  private buildAssetPositions(address: string, subaccountNumber: number): IndexerAssetPositionResponseObject[] {
    const assets = ['USDC', 'USDT'];
    return assets.map((symbol, idx) => {
      const seed = `${address}-${subaccountNumber}-${symbol}-${idx}`;
      return {
        symbol,
        side: idx % 2 === 0 ? IndexerPositionSide.LONG : IndexerPositionSide.SHORT,
        size: randomAmount(`${seed}-size`, 10_000, 90_000, 2),
        assetId: `asset-${symbol.toLowerCase()}`,
        subaccountNumber,
      };
    });
  }

  private buildOrders(address: string, subaccountNumber: number): IndexerOrderResponseObject[] {
    return this.markets.slice(0, 2).map((market, idx) => {
      const seed = `${address}-${subaccountNumber}-order-${idx}`;
      const id = `order-${address.slice(-6)}-${subaccountNumber}-${idx}`;
      const basePrice = this.getMarketBasePrice(market.ticker);
      return {
        id,
        subaccountId: `${address}-${subaccountNumber}`,
        clientId: randomBig(`${seed}-client`, 1_000_000, 9_999_999),
        clobPairId: market.clobPairId,
        side: idx % 2 === 0 ? IndexerOrderSide.BUY : IndexerOrderSide.SELL,
        size: randomBig(`${seed}-size`, 1_000_000, 9_000_000),
        totalFilled: randomBig(`${seed}-filled`, 500_000, 2_000_000),
        price: randomAmount(`${seed}-price`, basePrice * 0.95, basePrice * 1.05, 2),
        type: IndexerOrderType.LIMIT,
        reduceOnly: idx % 2 === 1,
        orderFlags: '64',
        goodTilBlock: (2_500_000 + idx * 100).toString(),
        goodTilBlockTime: isoMinutesAgo(this.now, (idx + 1) * 5),
        createdAtHeight: (2_200_000 + idx * 5).toString(),
        clientMetadata: randomBig(`${seed}-metadata`, 100, 10_000),
        triggerPrice: null,
        timeInForce: IndexerAPITimeInForce.GTT,
        status: idx === 0 ? IndexerOrderStatus.OPEN : IndexerOrderStatus.CANCELED,
        postOnly: idx % 2 === 0,
        ticker: market.ticker,
        updatedAt: isoMinutesAgo(this.now, idx * 3 + 1),
        updatedAtHeight: (2_200_500 + idx * 3).toString(),
        subaccountNumber,
      };
    });
  }

  private toCompositeOrder(order: IndexerOrderResponseObject, index: number): IndexerCompositeOrderObject {
    return {
      id: order.id,
      subaccountId: order.subaccountId,
      clientId: order.clientId,
      clobPairId: order.clobPairId,
      side: order.side,
      size: order.size,
      totalFilled: order.totalFilled,
      price: order.price,
      type: order.type,
      reduceOnly: order.reduceOnly,
      orderFlags: order.orderFlags,
      goodTilBlock: order.goodTilBlock,
      goodTilBlockTime: order.goodTilBlockTime,
      createdAtHeight: order.createdAtHeight,
      clientMetadata: order.clientMetadata,
      triggerPrice: order.triggerPrice ?? null,
      timeInForce: order.timeInForce,
      status: order.status as IndexerOrderStatus | IndexerBestEffortOpenedStatus,
      postOnly: order.postOnly,
      ticker: order.ticker,
      updatedAt: order.updatedAt,
      updatedAtHeight: order.updatedAtHeight,
      subaccountNumber: order.subaccountNumber,
      removalReason: index % 2 === 0 ? undefined : 'EXPIRED',
    };
  }

  private buildFills(
    address: string,
    subaccountNumber: number,
    orders: IndexerOrderResponseObject[]
  ): IndexerCompositeFillObject[] {
    return this.markets.slice(0, 2).map((market, idx) => {
      const seed = `${address}-${subaccountNumber}-fill-${idx}`;
      const basePrice = this.getMarketBasePrice(market.ticker);
      return {
        id: `fill-${address.slice(-4)}-${subaccountNumber}-${idx}`,
        side: idx % 2 === 0 ? IndexerOrderSide.BUY : IndexerOrderSide.SELL,
        liquidity: idx % 2 === 0 ? IndexerLiquidity.MAKER : IndexerLiquidity.TAKER,
        type: IndexerFillType.LIMIT,
        market: market.ticker,
        marketType: IndexerMarketType.PERPETUAL,
        price: randomAmount(`${seed}-price`, basePrice * 0.97, basePrice * 1.03, 2),
        size: randomBig(`${seed}-size`, 1_000_000, 8_000_000),
        fee: randomAmount(`${seed}-fee`, 10, 25, 4),
        affiliateRevShare: randomAmount(`${seed}-share`, 2, 5, 4),
        createdAt: isoMinutesAgo(this.now, (idx + 1) * 12),
        createdAtHeight: (2_300_000 + idx).toString(),
        orderId: orders[idx]?.id ?? null,
        clientMetadata: randomBig(`${seed}-metadata`, 10, 999),
        subaccountNumber,
      };
    });
  }

  private buildTransfers(
    address: string,
    subaccountNumber: number,
    parentSubaccountNumber: number
  ): IndexerTransferResponseObject[] {
    return [0, 1].map((idx) =>
      this.buildTransfer(address, subaccountNumber, address, subaccountNumber === 0 ? 1 : 0, `${parentSubaccountNumber}-${idx}`)
    );
  }

  private buildTransfer(
    senderAddress: string,
    senderSubaccount: number,
    recipientAddress: string,
    recipientSubaccount: number,
    seedSuffix: string
  ): IndexerTransferResponseObject {
    const seed = `${senderAddress}-${recipientAddress}-${seedSuffix}`;
    return {
      id: `transfer-${senderAddress.slice(-4)}-${seedSuffix}`,
      sender: this.buildTransferParty(senderAddress, senderSubaccount),
      recipient: this.buildTransferParty(recipientAddress, recipientSubaccount),
      size: randomAmount(`${seed}-size`, 1_000, 5_000, 2),
      createdAt: isoMinutesAgo(this.now, randomInt(`${seed}-minutes`, 30, 120)),
      createdAtHeight: (2_400_000 + randomInt(`${seed}-height`, 1, 100)).toString(),
      symbol: 'USDC',
      type: senderAddress === recipientAddress ? IndexerTransferType.TRANSFEROUT : IndexerTransferType.DEPOSIT,
      transactionHash: `0x${hashSeed(seed).toString(16).padStart(64, '0')}`,
    };
  }

  private buildTransferParty(address: string, subaccountNumber: number): IndexerTransferResponseObjectSender {
    return {
      address,
      subaccountNumber,
    };
  }

  private buildFundingPayments(
    address: string,
    subaccountNumber: number
  ): IndexerFundingPaymentResponseObject[] {
    return this.markets.slice(0, 2).map((market, idx) => {
      const seed = `${address}-${subaccountNumber}-funding-${idx}`;
      const basePrice = this.getMarketBasePrice(market.ticker);
      return {
        createdAt: isoMinutesAgo(this.now, (idx + 1) * 60),
        createdAtHeight: (2_500_000 + idx).toString(),
        perpetualId: market.clobPairId,
        ticker: market.ticker,
        oraclePrice: randomAmount(`${seed}-oracle`, basePrice * 0.98, basePrice * 1.02, 2),
        size: randomAmount(`${seed}-size`, 100, 1_000, 4),
        side: idx % 2 === 0 ? 'LONG' : 'SHORT',
        rate: randomAmount(`${seed}-rate`, -0.002, 0.002, 6),
        payment: randomAmount(`${seed}-payment`, -15, 15, 4),
        subaccountNumber: subaccountNumber.toString(),
      };
    });
  }

  private buildHistoricalPnl(address: string, subaccountNumber: number): IndexerPnlTicksResponseObject[] {
    const ticks: IndexerPnlTicksResponseObject[] = [];
    for (let i = 0; i < 24; i += 1) {
      const seed = `${address}-${subaccountNumber}-pnl-${i}`;
      ticks.push({
        equity: randomAmount(`${seed}-equity`, 80_000, 150_000, 2),
        totalPnl: randomAmount(`${seed}-total`, -5_000, 15_000, 2),
        netTransfers: randomAmount(`${seed}-transfers`, -2_000, 4_000, 2),
        createdAt: (this.now - i * ONE_MINUTE_MS * 30).toString(),
        blockHeight: (2_600_000 + i).toString(),
        blockTime: isoMinutesAgo(this.now, i * 30),
      });
    }
    return ticks;
  }

  private buildTradingRewards(
    address: string,
    subaccountNumber: number
  ): IndexerHistoricalTradingRewardAggregation[] {
    return [0, 1, 2].map((idx) => {
      const seed = `${address}-${subaccountNumber}-reward-${idx}`;
      return {
        tradingReward: randomAmount(`${seed}-amount`, 50, 250, 2),
        startedAt: isoMinutesAgo(this.now, (idx + 1) * 1440),
        startedAtHeight: (2_700_000 + idx * 100).toString(),
        endedAt: isoMinutesAgo(this.now, idx * 1440),
        endedAtHeight: (2_700_500 + idx * 100).toString(),
        period: IndexerTradingRewardAggregationPeriod.WEEKLY,
      };
    });
  }

  private buildBlockRewards(address: string, subaccountNumber: number): IndexerHistoricalBlockTradingReward[] {
    return [0, 1, 2, 3].map((idx) => {
      const seed = `${address}-${subaccountNumber}-block-${idx}`;
      return {
        tradingReward: randomAmount(`${seed}-amount`, 5, 25, 2),
        createdAt: isoMinutesAgo(this.now, idx * 10 + 5),
        createdAtHeight: (2_800_000 + idx).toString(),
      };
    });
  }

  private createMarketData(): IndexerPerpetualMarketResponseObject[] {
    return MARKET_SPECS.map((spec) => ({
      clobPairId: spec.clobPairId,
      ticker: spec.ticker,
      status: IndexerPerpetualMarketStatus.ACTIVE,
      oraclePrice: spec.basePrice.toFixed(2),
      priceChange24H: randomAmount(`${spec.ticker}-change`, -5, 5, 2),
      volume24H: (spec.baseVolume + 10_000_000).toString(),
      trades24H: randomInt(`${spec.ticker}-trades`, 2_000, 5_000),
      nextFundingRate: randomAmount(`${spec.ticker}-funding`, -0.002, 0.002, 6),
      initialMarginFraction: '0.05',
      maintenanceMarginFraction: '0.025',
      openInterest: (spec.baseVolume / 10).toString(),
      atomicResolution: -9,
      quantumConversionExponent: -6,
      tickSize: '0.01',
      stepSize: '1',
      stepBaseQuantums: 10_000,
      subticksPerTick: 100,
      marketType: IndexerPerpetualMarketType.CROSS,
      openInterestLowerCap: (spec.baseVolume / 20).toString(),
      openInterestUpperCap: (spec.baseVolume * 2).toString(),
      baseOpenInterest: (spec.baseVolume / 30).toString(),
      defaultFundingRate1H: '0.0001',
    }));
  }

  private createOrderbooks(): Record<string, IndexerOrderbookResponseObject> {
    return this.markets.reduce<Record<string, IndexerOrderbookResponseObject>>((acc, market) => {
      const basePrice = Number(market.oraclePrice);
      const bids = Array.from({ length: 5 }).map((_, idx) => ({
        price: (basePrice - idx - 0.5).toFixed(2),
        size: randomAmount(`${market.ticker}-bid-${idx}`, 100, 500, 4),
      }));
      const asks = Array.from({ length: 5 }).map((_, idx) => ({
        price: (basePrice + idx + 0.5).toFixed(2),
        size: randomAmount(`${market.ticker}-ask-${idx}`, 100, 500, 4),
      }));
      acc[market.ticker] = { bids, asks };
      return acc;
    }, {});
  }

  private createTrades(): Record<string, IndexerTradeResponseObject[]> {
    return this.markets.reduce<Record<string, IndexerTradeResponseObject[]>>((acc, market) => {
      const trades: IndexerTradeResponseObject[] = [];
      for (let i = 0; i < 30; i += 1) {
        const seed = `${market.ticker}-trade-${i}`;
        trades.push({
          id: `trade-${market.ticker}-${i}`,
          side: i % 2 === 0 ? IndexerOrderSide.BUY : IndexerOrderSide.SELL,
          size: randomBig(`${seed}-size`, 500_000, 5_000_000),
          price: randomAmount(`${seed}-price`, Number(market.oraclePrice) * 0.98, Number(market.oraclePrice) * 1.02, 2),
          type: IndexerTradeType.LIMIT,
          createdAt: isoMinutesAgo(this.now, i * 4 + 1),
          createdAtHeight: (3_000_000 + i).toString(),
        });
      }
      acc[market.ticker] = trades;
      return acc;
    }, {});
  }

  private createCandles(): Record<string, IndexerCandleResponseObject[]> {
    return this.markets.reduce<Record<string, IndexerCandleResponseObject[]>>((acc, market) => {
      const entries: IndexerCandleResponseObject[] = [];
      CANDLE_CONFIG.forEach((config) => {
        for (let i = 0; i < 60; i += 1) {
          const minutesAgo = config.minutes * i;
          const basePrice = Number(market.oraclePrice);
          const startedAt = isoMinutesAgo(this.now, minutesAgo);
          entries.push({
            id: `${market.ticker}-${config.resolution}-${startedAt}`,
            startedAt,
            ticker: market.ticker,
            resolution: config.resolution,
            low: (basePrice - config.minutes * 0.1 - i * 0.01).toFixed(2),
            high: (basePrice + config.minutes * 0.1 + i * 0.01).toFixed(2),
            open: (basePrice - 0.2).toFixed(2),
            close: (basePrice + 0.2).toFixed(2),
            baseTokenVolume: randomAmount(`${market.ticker}-candle-${config.resolution}-${i}-base`, 1_000, 9_000, 4),
            usdVolume: randomAmount(`${market.ticker}-candle-${config.resolution}-${i}-usd`, 10_000, 90_000, 2),
            trades: randomInt(`${market.ticker}-candle-${config.resolution}-${i}-trades`, 10, 200),
            startingOpenInterest: randomAmount(`${market.ticker}-candle-${config.resolution}-${i}-oi`, 500, 900, 4),
          });
        }
      });
      acc[market.ticker] = entries;
      return acc;
    }, {});
  }

  private createHistoricalFunding(): Record<string, IndexerHistoricalFundingResponseObject[]> {
    return this.markets.reduce<Record<string, IndexerHistoricalFundingResponseObject[]>>((acc, market) => {
      const entries: IndexerHistoricalFundingResponseObject[] = [];
      for (let i = 0; i < 48; i += 1) {
        entries.push({
          ticker: market.ticker,
          rate: randomAmount(`${market.ticker}-funding-${i}`, -0.002, 0.002, 6),
          price: randomAmount(`${market.ticker}-funding-price-${i}`, Number(market.oraclePrice) * 0.97, Number(market.oraclePrice) * 1.03, 2),
          effectiveAt: isoMinutesAgo(this.now, i * 60),
          effectiveAtHeight: (3_500_000 + i).toString(),
        });
      }
      acc[market.ticker] = entries;
      return acc;
    }, {});
  }

  private createSparklines(): IndexerSparklineResponseObject {
    return this.markets.reduce<IndexerSparklineResponseObject>((acc, market) => {
      acc[market.ticker] = Array.from({ length: 24 }).map((_, idx) =>
        randomAmount(`${market.ticker}-spark-${idx}`, Number(market.oraclePrice) * 0.9, Number(market.oraclePrice) * 1.1, 2)
      );
      return acc;
    }, {});
  }

  private createMegavaultPositions(): IndexerMegavaultPositionResponse {
    const positions: IndexerVaultPosition[] = this.markets.map((market) => ({
      ticker: market.ticker,
      assetPosition: {
        symbol: 'USDC',
        side: IndexerPositionSide.LONG,
        size: randomAmount(`${market.ticker}-vault-asset`, 50_000, 150_000, 2),
        assetId: `asset-${market.ticker.toLowerCase()}`,
        subaccountNumber: 0,
      },
      perpetualPosition: {
        market: market.ticker,
        status: IndexerPerpetualPositionStatus.OPEN,
        side: IndexerPositionSide.LONG,
        size: randomBig(`${market.ticker}-vault-pos-size`, 1_000_000, 5_000_000),
        maxSize: randomBig(`${market.ticker}-vault-pos-max`, 5_000_000, 10_000_000),
        entryPrice: randomAmount(`${market.ticker}-vault-entry`, Number(market.oraclePrice) * 0.98, Number(market.oraclePrice) * 1.02, 2),
        realizedPnl: randomAmount(`${market.ticker}-vault-realized`, 500, 2_000, 2),
        createdAt: isoMinutesAgo(this.now, 90),
        createdAtHeight: '100',
        sumOpen: '0',
        sumClose: '0',
        netFunding: '0',
        unrealizedPnl: '0',
        closedAt: null,
        exitPrice: null,
        subaccountNumber: 0,
      },
      equity: randomAmount(`${market.ticker}-vault-equity`, 100_000, 250_000, 2),
    }));
    return { positions };
  }

  private createMegavaultHistoricalPnl(): IndexerMegavaultHistoricalPnlResponse {
    const megavaultPnl: IndexerPnlTicksResponseObject[] = Array.from({ length: 24 }).map((_, idx) => ({
      equity: randomAmount(`megavault-pnl-${idx}-equity`, 500_000, 700_000, 2),
      totalPnl: randomAmount(`megavault-pnl-${idx}-total`, -10_000, 30_000, 2),
      netTransfers: randomAmount(`megavault-pnl-${idx}-transfer`, -5_000, 10_000, 2),
      createdAt: (this.now - idx * 3600000).toString(),
      blockHeight: (4_000_000 + idx).toString(),
      blockTime: isoMinutesAgo(this.now, idx * 60),
    }));
    return { megavaultPnl };
  }

  private createVaultHistoricalPnl(): IndexerVaultsHistoricalPnlResponse {
    const vaultsPnl: IndexerVaultHistoricalPnl[] = this.markets.map((market) => ({
      ticker: market.ticker,
      historicalPnl: Array.from({ length: 24 }).map((_, idx) => ({
        equity: randomAmount(`${market.ticker}-hist-${idx}-equity`, 120_000, 220_000, 2),
        totalPnl: randomAmount(`${market.ticker}-hist-${idx}-total`, -2_000, 8_000, 2),
        netTransfers: randomAmount(`${market.ticker}-hist-${idx}-transfer`, -1_000, 3_000, 2),
        createdAt: (this.now - idx * 1800000).toString(),
        blockHeight: (4_500_000 + idx).toString(),
        blockTime: isoMinutesAgo(this.now, idx * 30),
      })),
    }));
    return { vaultsPnl };
  }
}
