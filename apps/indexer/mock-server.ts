import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from '@as-integrations/fastify';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { readFileSync } from 'fs';
import { WebSocket, WebSocketServer } from 'ws';

import { 
  IndexerCandleResolution, 
  IndexerPerpetualMarketResponseObject,
  IndexerPerpetualPositionResponseObject,
  IndexerFillResponseObject
} from '../../src/types/indexer/indexerApiGen';
import { createMockDataProvider, MockDataProvider } from './src/providers';
import { registerRestRoutes } from './src/rest-routes';

type GraphAddress = {
  id: string;
  address: string;
  metadata: Record<string, unknown>;
};

type GraphAccount = {
  id: string;
  address: string;
  subaccountNumber: number;
  subaccountId: string;
  ownerId: string;
  isLiquidator: boolean;
  isHandler: boolean;
  isManager: boolean;
  metadata: Record<string, unknown>;
};

type GraphMarket = {
  id: string;
  ticker: string;
  atomicResolution: number;
  baseOpenInterest: string;
  defaultFundingRate1H: string;
  initialMarginFraction: string;
  maintenanceMarginFraction: string;
  marketType: string;
  nextFundingRate: string;
  openInterest: string;
  openInterestLowerCap?: string | null;
  openInterestUpperCap?: string | null;
  oraclePrice: { price: string; timestamp: bigint };
  priceChange24H: string;
  quantumConversionExponent: number;
  status: string;
  stepBaseQuantums: number;
  stepSize: string;
  subticksPerTick: number;
  tickSize: string;
  trades24H: number;
  volume24H: string;
};

type GraphPosition = {
  id: string;
  status: string;
  side: string;
  size: bigint;
  maxSize: bigint;
  entryPrice: string;
  exitPrice: string | null;
  realizedPnl: string;
  createdAt: string;
  createdAtHeight: number;
  sumOpen: string;
  sumClose: string;
  netFunding: string;
  unrealizedPnl: string;
  closedAt: string | null;
  subaccountNumber: number;
  ticker: string;
  collateral: string;
  positionFees: string;
  entryFundingRate: string;
  reserveAmount: string;
  lastIncreasedTime: string;
  accountId: string;
  marketId: string;
};

type GraphTrade = {
  id: string;
  created_at_height: number;
  created_at: string;
  side: string;
  price: string;
  size: bigint;
  trade_type: string;
  marketId: string;
  positionId: string | null;
};

type GraphPayment = {
  id: string;
  createdAt: bigint;
  createdAtHeight: number;
  ticker: string;
  oraclePrice: string;
  size: string;
  side: string;
  rate: string;
  payment: string;
  subaccountNumber: number;
  fundingIndex: string;
  type: string;
  marketId: string;
  positionId: string | null;
};

type GraphCandle = {
  id: string;
  ticker: string;
  resolution: string;
  startedAt: bigint;
  open: string;
  close: string;
  high: string;
  low: string;
  baseTokenVolume: string;
  usdVolume: string;
  startingOpenInterest: string;
  marketId: string;
};

type GraphSnapshot = {
  addresses: GraphAddress[];
  accounts: GraphAccount[];
  markets: GraphMarket[];
  positions: GraphPosition[];
  trades: GraphTrade[];
  payments: GraphPayment[];
  candles: GraphCandle[];
};

const SAMPLE_ADDRESSES = Array.from({ length: 4 }).map(
  (_, idx) => `0x${(idx + 1).toString(16).padStart(40, String(idx + 1))}`
);

const typeDefs = readFileSync('./schema-clean.graphql', 'utf8');

// WebSocket subscription management
interface Subscription {
  channel: string;
  id?: string;
  interval?: NodeJS.Timeout;
}

const clientSubscriptions = new Map<WebSocket, Subscription[]>();
const messageCounters = new Map<WebSocket, number>();

function getNextMessageId(ws: WebSocket): number {
  const current = messageCounters.get(ws) ?? 1;
  messageCounters.set(ws, current + 1);
  return current;
}

function paginateResults<T>(results: T[], first?: number, after?: string): T[] {
  if (!first) return results;

  let startIndex = 0;
  if (after) {
    const afterIndex = results.findIndex((item) => (item as { id?: string }).id === after);
    if (afterIndex >= 0) {
      startIndex = afterIndex + 1;
    }
  }

  return results.slice(startIndex, startIndex + first);
}

function createResolvers(graphSnapshot: GraphSnapshot) {
  return {
    Query: {
    addresses: (_: unknown, args: { first?: number; after?: string }) =>
      paginateResults(graphSnapshot.addresses, args.first, args.after),
    address: (_: unknown, args: { id: string }) =>
      graphSnapshot.addresses.find((item) => item.id === args.id),
    markets: (_: unknown, args: { first?: number; after?: string; ticker?: string }) => {
      let results = graphSnapshot.markets;
      if (args.ticker) {
        results = results.filter((market) => market.ticker === args.ticker);
      }
      return paginateResults(results, args.first, args.after);
    },
    market: (_: unknown, args: { id: string }) =>
      graphSnapshot.markets.find((market) => market.id === args.id),
    accounts: (_: unknown, args: { first?: number; after?: string; address?: string }) => {
      let results = graphSnapshot.accounts;
      if (args.address) {
        results = results.filter((account) => account.address === args.address);
      }
      return paginateResults(results, args.first, args.after);
    },
    account: (_: unknown, args: { id: string }) =>
      graphSnapshot.accounts.find((account) => account.id === args.id),
    positions: (
      _: unknown,
      args: { first?: number; after?: string; status?: string; account?: string; market?: string; side?: string }
    ) => {
      let results = graphSnapshot.positions;
      if (args.status) {
        results = results.filter((position) => position.status === args.status);
      }
      if (args.account) {
        results = results.filter((position) => position.accountId === args.account);
      }
      if (args.market) {
        const market = graphSnapshot.markets.find(
          (m) => m.id === args.market || m.ticker === args.market
        );
        if (market) {
          results = results.filter((position) => position.marketId === market.id);
        }
      }
      if (args.side) {
        results = results.filter((position) => position.side === args.side);
      }
      return paginateResults(results, args.first, args.after);
    },
    position: (_: unknown, args: { id: string }) =>
      graphSnapshot.positions.find((position) => position.id === args.id),
    trades: (_: unknown, args: { first?: number; after?: string; market?: string; side?: string }) => {
      let results = graphSnapshot.trades;
      if (args.market) {
        const market = graphSnapshot.markets.find(
          (m) => m.id === args.market || m.ticker === args.market
        );
        if (market) {
          results = results.filter((trade) => trade.marketId === market.id);
        }
      }
      if (args.side) {
        results = results.filter((trade) => trade.side === args.side);
      }
      return paginateResults(results, args.first, args.after);
    },
    trade: (_: unknown, args: { id: string }) =>
      graphSnapshot.trades.find((trade) => trade.id === args.id),
    payments: (
      _: unknown,
      args: { first?: number; after?: string; market?: string; type?: string; side?: string }
    ) => {
      let results = graphSnapshot.payments;
      if (args.market) {
        const market = graphSnapshot.markets.find(
          (m) => m.id === args.market || m.ticker === args.market
        );
        if (market) {
          results = results.filter((payment) => payment.marketId === market.id);
        }
      }
      if (args.type) {
        results = results.filter((payment) => payment.type === args.type);
      }
      if (args.side) {
        results = results.filter((payment) => payment.side === args.side);
      }
      return paginateResults(results, args.first, args.after);
    },
    payment: (_: unknown, args: { id: string }) =>
      graphSnapshot.payments.find((payment) => payment.id === args.id),
    candles: (
      _: unknown,
      args: { first?: number; after?: string; market?: string; resolution?: string }
    ) => {
      let results = graphSnapshot.candles;
      if (args.market) {
        const market = graphSnapshot.markets.find(
          (m) => m.id === args.market || m.ticker === args.market
        );
        if (market) {
          results = results.filter((candle) => candle.marketId === market.id);
        }
      }
      if (args.resolution) {
        results = results.filter((candle) => candle.resolution === args.resolution);
      }
      return paginateResults(results, args.first, args.after);
    },
    candle: (_: unknown, args: { id: string }) =>
      graphSnapshot.candles.find((candle) => candle.id === args.id),
    assets: () => [],
    asset: () => null,
  },
  Address: {
    subaccount: (parent: GraphAddress) => {
      const account = graphSnapshot.accounts.find((acc) => acc.address === parent.address);
      if (!account) return null;
      return { id: `${account.id}-sub`, account };
    },
  },
  Subaccount: {
    account: (parent: { account: GraphAccount }) => parent.account,
  },
  Account: {
    owner: (parent: GraphAccount) =>
      graphSnapshot.addresses.find((address) => address.id === parent.ownerId),
    positions: (
      parent: GraphAccount,
      args: { first?: number; after?: string; status?: string }
    ) => {
      let results = graphSnapshot.positions.filter((position) => position.accountId === parent.id);
      if (args.status) {
        results = results.filter((position) => position.status === args.status);
      }
      return paginateResults(results, args.first, args.after);
    },
  },
  Market: {
    positions: (
      parent: GraphMarket,
      args: { first?: number; after?: string; status?: string }
    ) => {
      let results = graphSnapshot.positions.filter((position) => position.marketId === parent.id);
      if (args.status) {
        results = results.filter((position) => position.status === args.status);
      }
      return paginateResults(results, args.first, args.after);
    },
    trades: (parent: GraphMarket, args: { first?: number; after?: string }) =>
      paginateResults(
        graphSnapshot.trades.filter((trade) => trade.marketId === parent.id),
        args.first,
        args.after
      ),
    candles: (parent: GraphMarket, args: { first?: number; after?: string; resolution?: string }) => {
      let results = graphSnapshot.candles.filter((candle) => candle.marketId === parent.id);
      if (args.resolution) {
        results = results.filter((candle) => candle.resolution === args.resolution);
      }
      return paginateResults(results, args.first, args.after);
    },
    payments: (parent: GraphMarket, args: { first?: number; after?: string }) =>
      paginateResults(
        graphSnapshot.payments.filter((payment) => payment.marketId === parent.id),
        args.first,
        args.after
      ),
  },
  Position: {
    account: (parent: GraphPosition) =>
      graphSnapshot.accounts.find((account) => account.id === parent.accountId),
    market: (parent: GraphPosition) =>
      graphSnapshot.markets.find((market) => market.id === parent.marketId),
  },
  Trade: {
    market: (parent: GraphTrade) =>
      graphSnapshot.markets.find((market) => market.id === parent.marketId),
    position: (parent: GraphTrade) =>
      parent.positionId
        ? graphSnapshot.positions.find((position) => position.id === parent.positionId)
        : null,
  },
  Payment: {
    market: (parent: GraphPayment) =>
      graphSnapshot.markets.find((market) => market.id === parent.marketId),
    position: (parent: GraphPayment) =>
      parent.positionId
        ? graphSnapshot.positions.find((position) => position.id === parent.positionId)
        : null,
  },
  Candle: {
    market: (parent: GraphCandle) =>
      graphSnapshot.markets.find((market) => market.id === parent.marketId),
  },
  };
}

// WebSocket server setup and handlers
function setupWebSocketServer(wss: WebSocketServer, mockProvider: MockDataProvider) {
  wss.on('connection', (ws: WebSocket) => {
    console.log('[ws] Client connected');
    clientSubscriptions.set(ws, []);
    messageCounters.set(ws, 1);

    sendMessage(ws, {
      type: 'connected',
      message_id: getNextMessageId(ws),
    });

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(ws, message, mockProvider);
      } catch (error) {
        console.error('[ws] Failed to parse message:', error);
        sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      console.log('[ws] Client disconnected');
      cleanupSubscriptions(ws);
      messageCounters.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('[ws] WebSocket error:', error);
      cleanupSubscriptions(ws);
      messageCounters.delete(ws);
    });
  });
}

function handleWebSocketMessage(ws: WebSocket, message: any, mockProvider: MockDataProvider) {
  const { type, channel, id } = message;

  switch (type) {
    case 'subscribe':
      handleSubscribe(ws, channel, id, mockProvider);
      break;
    case 'unsubscribe':
      handleUnsubscribe(ws, channel, id);
      break;
    case 'ping':
      sendMessage(ws, { type: 'pong', time: Date.now() });
      break;
    default:
      console.warn('[ws] Unknown message type:', type);
      sendError(ws, `Unknown message type: ${type}`);
  }
}

function normalizeChannelAndId(channel: string, id?: string): { channel: string; id?: string } {
  if (channel.startsWith('v4_orderbook/')) {
    return { channel: 'v4_orderbook', id: channel.replace('v4_orderbook/', '') };
  }
  if (channel.startsWith('v4_trades/')) {
    return { channel: 'v4_trades', id: channel.replace('v4_trades/', '') };
  }
  return { channel, id };
}

function handleSubscribe(ws: WebSocket, channel: string, id: string | undefined, mockProvider: MockDataProvider) {
  const { channel: normalizedChannel, id: normalizedId } = normalizeChannelAndId(channel, id);
  console.log(`[ws] Subscribe request: ${normalizedChannel}${normalizedId ? ` (id: ${normalizedId})` : ''}`);

  const subscriptions = clientSubscriptions.get(ws) || [];
  
  // Check if already subscribed
  if (subscriptions.some(sub => sub.channel === normalizedChannel && sub.id === normalizedId)) {
    console.log(`[ws] Already subscribed to ${normalizedChannel}`);
    return;
  }

  // Handle different channel types
  if (normalizedChannel === 'v4_parent_subaccounts') {
    subscribeToParentSubaccounts(ws, normalizedId, mockProvider);
  } else if (normalizedChannel === 'v4_subaccounts') {
    subscribeToSubaccounts(ws, normalizedId, mockProvider);
  } else if (normalizedChannel === 'v4_markets') {
    subscribeToMarkets(ws, mockProvider);
  } else if (normalizedChannel === 'v4_orderbook') {
    subscribeToOrderbook(ws, normalizedId, mockProvider);
  } else if (normalizedChannel === 'v4_trades') {
    subscribeToTrades(ws, normalizedId, mockProvider);
  } else {
    console.warn(`[ws] Unknown channel: ${normalizedChannel}`);
    sendError(ws, `Unknown channel: ${normalizedChannel}`);
  }
}

function handleUnsubscribe(ws: WebSocket, channel: string, id?: string) {
  const { channel: normalizedChannel, id: normalizedId } = normalizeChannelAndId(channel, id);
  console.log(`[ws] Unsubscribe request: ${normalizedChannel}${normalizedId ? ` (id: ${normalizedId})` : ''}`);
  
  const subscriptions = clientSubscriptions.get(ws) || [];
  const subIndex = subscriptions.findIndex(sub => sub.channel === normalizedChannel && sub.id === normalizedId);
  
  if (subIndex !== -1) {
    const subscription = subscriptions[subIndex];
    if (subscription.interval) {
      clearInterval(subscription.interval);
    }
    subscriptions.splice(subIndex, 1);
    
    sendMessage(ws, {
      type: 'unsubscribed',
      channel: normalizedChannel,
      id: normalizedId,
      message_id: getNextMessageId(ws),
    });
  }
}

function cleanupSubscriptions(ws: WebSocket) {
  const subscriptions = clientSubscriptions.get(ws) || [];
  subscriptions.forEach(sub => {
    if (sub.interval) {
      clearInterval(sub.interval);
    }
  });
  clientSubscriptions.delete(ws);
}

// Channel-specific subscription handlers
function subscribeToParentSubaccounts(ws: WebSocket, id: string | undefined, mockProvider: MockDataProvider) {
  if (!id) {
    sendError(ws, 'v4_parent_subaccounts requires id (address/parentSubaccountNumber)');
    return;
  }

  const [address, parentSubaccountNumberStr] = id.split('/');
  const parentSubaccountNumber = parseInt(parentSubaccountNumberStr || '0', 10);

  // Send initial subscribed confirmation
  sendMessage(ws, {
    type: 'subscribed',
    channel: 'v4_parent_subaccounts',
    id,
    connection_id: `conn-${Date.now()}`,
    message_id: getNextMessageId(ws),
  });

  // Send initial data immediately
  sendParentSubaccountUpdate(ws, address, parentSubaccountNumber, id, mockProvider);

  // Set up periodic updates (every 3 seconds)
  const interval = setInterval(() => {
    sendParentSubaccountUpdate(ws, address, parentSubaccountNumber, id, mockProvider);
  }, 3000);

  const subscriptions = clientSubscriptions.get(ws) || [];
  subscriptions.push({
    channel: 'v4_parent_subaccounts',
    id,
    interval,
  });
  clientSubscriptions.set(ws, subscriptions);
}

function subscribeToSubaccounts(ws: WebSocket, id: string | undefined, mockProvider: MockDataProvider) {
  if (!id) {
    sendError(ws, 'v4_subaccounts requires id (address/subaccountNumber)');
    return;
  }

  const [address, subaccountNumberStr] = id.split('/');
  const subaccountNumber = parseInt(subaccountNumberStr || '0', 10);

  sendMessage(ws, {
    type: 'subscribed',
    channel: 'v4_subaccounts',
    id,
    connection_id: `conn-${Date.now()}`,
    message_id: getNextMessageId(ws),
  });

  sendSubaccountUpdate(ws, address, subaccountNumber, id, mockProvider);

  const interval = setInterval(() => {
    sendSubaccountUpdate(ws, address, subaccountNumber, id, mockProvider);
  }, 3000);

  const subscriptions = clientSubscriptions.get(ws) || [];
  subscriptions.push({
    channel: 'v4_subaccounts',
    id,
    interval,
  });
  clientSubscriptions.set(ws, subscriptions);
}

function subscribeToMarkets(ws: WebSocket, mockProvider: MockDataProvider) {
  sendMessage(ws, {
    type: 'subscribed',
    channel: 'v4_markets',
    connection_id: `conn-${Date.now()}`,
    message_id: getNextMessageId(ws),
  });

  sendMarketsUpdate(ws, mockProvider);

  const interval = setInterval(() => {
    sendMarketsUpdate(ws, mockProvider);
  }, 2000);

  const subscriptions = clientSubscriptions.get(ws) || [];
  subscriptions.push({
    channel: 'v4_markets',
    interval,
  });
  clientSubscriptions.set(ws, subscriptions);
}

function subscribeToOrderbook(ws: WebSocket, ticker: string | undefined, mockProvider: MockDataProvider) {
  if (!ticker) {
    sendError(ws, 'v4_orderbook requires id (ticker)');
    return;
  }

  sendMessage(ws, {
    type: 'subscribed',
    channel: 'v4_orderbook',
    id: ticker,
    connection_id: `conn-${Date.now()}`,
    message_id: getNextMessageId(ws),
  });

  sendOrderbookUpdate(ws, ticker, mockProvider);

  const interval = setInterval(() => {
    sendOrderbookUpdate(ws, ticker, mockProvider);
  }, 1500);

  const subscriptions = clientSubscriptions.get(ws) || [];
  subscriptions.push({
    channel: 'v4_orderbook',
    id: ticker,
    interval,
  });
  clientSubscriptions.set(ws, subscriptions);
}

function subscribeToTrades(ws: WebSocket, ticker: string | undefined, mockProvider: MockDataProvider) {
  if (!ticker) {
    sendError(ws, 'v4_trades requires id (ticker)');
    return;
  }

  sendMessage(ws, {
    type: 'subscribed',
    channel: 'v4_trades',
    id: ticker,
    connection_id: `conn-${Date.now()}`,
    message_id: getNextMessageId(ws),
  });

  sendTradesUpdate(ws, ticker, mockProvider);

  const interval = setInterval(() => {
    sendTradesUpdate(ws, ticker, mockProvider);
  }, 4000);

  const subscriptions = clientSubscriptions.get(ws) || [];
  subscriptions.push({
    channel: 'v4_trades',
    id: ticker,
    interval,
  });
  clientSubscriptions.set(ws, subscriptions);
}

// Data update senders
function sendParentSubaccountUpdate(ws: WebSocket, address: string, parentSubaccountNumber: number, id: string, mockProvider: MockDataProvider) {
  try {
    const data = mockProvider.getParentSubaccount(address, parentSubaccountNumber);
    
    sendMessage(ws, {
      type: 'channel_data',
      channel: 'v4_parent_subaccounts',
      id,
      version: '1.0',
      message_id: getNextMessageId(ws),
      contents: data,
    });
  } catch (error) {
    console.error('[ws] Error sending parent subaccount update:', error);
  }
}

function sendSubaccountUpdate(ws: WebSocket, address: string, subaccountNumber: number, id: string, mockProvider: MockDataProvider) {
  try {
    const data = mockProvider.getSubaccount(address, subaccountNumber);
    
    sendMessage(ws, {
      type: 'channel_data',
      channel: 'v4_subaccounts',
      id,
      version: '1.0',
      message_id: getNextMessageId(ws),
      contents: data,
    });
  } catch (error) {
    console.error('[ws] Error sending subaccount update:', error);
  }
}

async function sendMarketsUpdate(ws: WebSocket, mockProvider: MockDataProvider) {
  try {
    const markets = await Promise.resolve(mockProvider.getPerpetualMarkets());
    
    sendMessage(ws, {
      type: 'channel_data',
      channel: 'v4_markets',
      version: '1.0',
      message_id: getNextMessageId(ws),
      contents: markets,
    });
  } catch (error) {
    console.error('[ws] Error sending markets update:', error);
  }
}

function sendOrderbookUpdate(ws: WebSocket, ticker: string, mockProvider: MockDataProvider) {
  try {
    const orderbook = mockProvider.getPerpetualMarketOrderbook(ticker);
    
    sendMessage(ws, {
      type: 'channel_data',
      channel: 'v4_orderbook',
      id: ticker,
      version: '1.0',
      message_id: getNextMessageId(ws),
      contents: orderbook,
    });
  } catch (error) {
    console.error('[ws] Error sending orderbook update:', error);
  }
}

function sendTradesUpdate(ws: WebSocket, ticker: string, mockProvider: MockDataProvider) {
  try {
    const trades = mockProvider.getPerpetualMarketTrades(ticker);
    
    sendMessage(ws, {
      type: 'channel_data',
      channel: 'v4_trades',
      id: ticker,
      version: '1.0',
      message_id: getNextMessageId(ws),
      contents: trades,
    });
  } catch (error) {
    console.error('[ws] Error sending trades update:', error);
  }
}

// WebSocket utility functions
function sendMessage(ws: WebSocket, message: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws: WebSocket, error: string) {
  sendMessage(ws, {
    type: 'error',
    message: error,
    message_id: getNextMessageId(ws),
  });
}

async function start() {
  // Initialize mock data provider (async for database mode)
  const mockProvider = await createMockDataProvider();
  const graphSnapshot = await createGraphSnapshot(mockProvider);
  const resolvers = createResolvers(graphSnapshot);
  
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true });
  registerRestRoutes(app, mockProvider);

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(app)],
  });
  await apolloServer.start();

  app.route({
    url: '/graphql',
    method: ['GET', 'POST', 'OPTIONS'],
    handler: fastifyApolloHandler(apolloServer),
  });

  const address = await app.listen({ host: '0.0.0.0', port: 4000 });
  console.log(`[mock-indexer] REST + GraphQL ready at ${address}`);
  console.log('[mock-indexer] GraphQL endpoint available at /graphql');

  // Set up WebSocket server
  const wss = new WebSocketServer({ port: 4001 });
  setupWebSocketServer(wss, mockProvider);
  console.log('[mock-indexer] WebSocket server ready at ws://0.0.0.0:4001');
}



start().catch((error) => {
  console.error('[mock-indexer] failed to start', error);
  process.exit(1);
});

async function createGraphSnapshot(service: any): Promise<GraphSnapshot> {
  const addresses: GraphAddress[] = SAMPLE_ADDRESSES.map((address, idx) => ({
    id: `addr-${idx + 1}`,
    address,
    metadata: { name: `Address ${idx + 1}` },
  }));

  const accounts: GraphAccount[] = [];
  addresses.forEach((address) => {
    [0, 1].forEach((subaccountNumber) => {
      accounts.push({
        id: `${address.id}-acct-${subaccountNumber}`,
        address: address.address,
        subaccountNumber,
        subaccountId: `${address.address}-${subaccountNumber}`,
        ownerId: address.id,
        isLiquidator: false,
        isHandler: false,
        isManager: false,
        metadata: { label: `Account ${subaccountNumber}` },
      });
    });
  });

  // Await getPerpetualMarkets() since it may return a Promise in database mode
  const marketsResponse = await Promise.resolve(service.getPerpetualMarkets());
  const markets: GraphMarket[] = (Object.values(marketsResponse.markets) as IndexerPerpetualMarketResponseObject[]).map(
    (market, idx) => ({
      id: market.clobPairId || `market-${idx + 1}`,
      ticker: market.ticker,
      atomicResolution: market.atomicResolution,
      baseOpenInterest: market.baseOpenInterest,
      defaultFundingRate1H: market.defaultFundingRate1H ?? '0',
      initialMarginFraction: market.initialMarginFraction,
      maintenanceMarginFraction: market.maintenanceMarginFraction,
      marketType: 'PERP',
      nextFundingRate: market.nextFundingRate,
      openInterest: market.openInterest,
      openInterestLowerCap: market.openInterestLowerCap,
      openInterestUpperCap: market.openInterestUpperCap,
      oraclePrice: { price: market.oraclePrice, timestamp: BigInt(Date.now()) },
      priceChange24H: market.priceChange24H,
      quantumConversionExponent: market.quantumConversionExponent,
      status: toGraphMarketStatus(market.status),
      stepBaseQuantums: market.stepBaseQuantums,
      stepSize: market.stepSize,
      subticksPerTick: market.subticksPerTick,
      tickSize: market.tickSize,
      trades24H: market.trades24H,
      volume24H: market.volume24H,
    })
  );

  // Fetch all positions data upfront
  const allPositionsData = await Promise.all(
    accounts.map(async (account) => ({
      account,
      data: await Promise.resolve(service.getPerpetualPositions(account.address, account.subaccountNumber))
    }))
  );

  const positions: GraphPosition[] = allPositionsData.flatMap(({ account, data }) => {
    const { positions: positionList } = data;
    return positionList.map((position: IndexerPerpetualPositionResponseObject, idx: number) => {
      const market = markets.find((m) => m.ticker === position.market) ?? markets[0];
      return {
        id: `${account.id}-pos-${idx}`,
        status: position.status,
        side: position.side,
        size: BigInt(position.size),
        maxSize: BigInt(position.maxSize),
        entryPrice: position.entryPrice,
        exitPrice: position.exitPrice ?? null,
        realizedPnl: position.realizedPnl,
        createdAt: position.createdAt,
        createdAtHeight: Number(position.createdAtHeight),
        sumOpen: position.sumOpen,
        sumClose: position.sumClose,
        netFunding: position.netFunding,
        unrealizedPnl: position.unrealizedPnl,
        closedAt: position.closedAt,
        subaccountNumber: position.subaccountNumber,
        ticker: position.market,
        collateral: '0',
        positionFees: '0',
        entryFundingRate: '0',
        reserveAmount: '0',
        lastIncreasedTime: position.createdAt,
        accountId: account.id,
        marketId: market.id,
      };
    });
  });

  // Fetch all trades data upfront
  const allTradesData = await Promise.all(
    markets.map(async (market) => ({
      market,
      data: await Promise.resolve(service.getPerpetualMarketTrades(market.ticker, 10))
    }))
  );

  const trades: GraphTrade[] = allTradesData.flatMap(({ market, data }) => {
    const { trades: tradeList } = data;
    return tradeList.map((trade: any) => {
      const position = positions.find((pos) => pos.marketId === market.id) ?? null;
      return {
        id: trade.id,
        created_at_height: Number(trade.createdAtHeight),
        created_at: trade.createdAt,
        side: trade.side,
        price: trade.price,
        size: BigInt(trade.size),
        trade_type: trade.type === 'LIQUIDATED' ? 'Liquidation' : 'Limit',
        marketId: market.id,
        positionId: position?.id ?? null,
      };
    });
  });

  const payments: GraphPayment[] = accounts.flatMap((account) => {
    const { fundingPayments } = service.getSubaccountFundingPayments(
      account.address,
      account.subaccountNumber
    );
    return fundingPayments.map((payment: any, idx: number) => {
      const market = markets.find((m) => m.ticker === payment.ticker) ?? markets[0];
      const position =
        positions.find((pos) => pos.accountId === account.id && pos.marketId === market.id) ?? null;
      return {
        id: `${account.id}-payment-${idx}`,
        createdAt: BigInt(Date.parse(payment.createdAt)),
        createdAtHeight: Number(payment.createdAtHeight),
        ticker: payment.ticker,
        oraclePrice: payment.oraclePrice,
        size: payment.size,
        side: payment.side,
        rate: payment.rate,
        payment: payment.payment,
        subaccountNumber: Number(payment.subaccountNumber),
        fundingIndex: `${idx}`,
        type: 'FUNDING',
        marketId: market.id,
        positionId: position?.id ?? null,
      };
    });
  });

  const candles: GraphCandle[] = markets.flatMap((market) => {
    const { candles: candleList } = service.getPerpetualMarketCandles(
      market.ticker,
      IndexerCandleResolution._1HOUR,
      12
    );
    return candleList.map((candle: any, idx: number) => ({
      id: `${market.id}-candle-${idx}`,
      ticker: candle.ticker,
      resolution: toGraphResolution(candle.resolution),
      startedAt: BigInt(Date.parse(candle.startedAt)),
      open: candle.open,
      close: candle.close,
      high: candle.high,
      low: candle.low,
      baseTokenVolume: candle.baseTokenVolume,
      usdVolume: candle.usdVolume,
      startingOpenInterest: candle.startingOpenInterest,
      marketId: market.id,
    }));
  });

  return { addresses, accounts, markets, positions, trades, payments, candles };
}

function toGraphMarketStatus(status: string): string {
  switch (status) {
    case 'PAUSED':
      return 'Paused';
    case 'CANCEL_ONLY':
      return 'CancelOnly';
    case 'POST_ONLY':
      return 'PostOnly';
    case 'INITIALIZING':
      return 'Initializing';
    case 'FINAL_SETTLEMENT':
      return 'FinalSettlement';
    default:
      return 'Active';
  }
}

function toGraphResolution(resolution: IndexerCandleResolution | string): string {
  switch (resolution) {
    case IndexerCandleResolution._1MIN:
      return 'M1';
    case IndexerCandleResolution._5MINS:
      return 'M5';
    case IndexerCandleResolution._15MINS:
      return 'M15';
    case IndexerCandleResolution._30MINS:
      return 'M30';
    case IndexerCandleResolution._1HOUR:
      return 'H1';
    case IndexerCandleResolution._4HOURS:
      return 'H4';
    case IndexerCandleResolution._1DAY:
      return 'D1';
    default:
      return 'H1';
  }
}
