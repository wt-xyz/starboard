import type { FastifyInstance } from 'fastify';

import {
  IndexerCandleResolution,
  IndexerPerpetualPositionStatus,
} from '../../../src/types/indexer/indexerApiGen';
import { MockDataProvider } from './providers/MockDataProvider.interface';

const RESOLUTION_MAP: Record<string, IndexerCandleResolution> = {
  M1: IndexerCandleResolution._1MIN,
  '1MIN': IndexerCandleResolution._1MIN,
  M5: IndexerCandleResolution._5MINS,
  '5MINS': IndexerCandleResolution._5MINS,
  M15: IndexerCandleResolution._15MINS,
  '15MINS': IndexerCandleResolution._15MINS,
  M30: IndexerCandleResolution._30MINS,
  '30MINS': IndexerCandleResolution._30MINS,
  H1: IndexerCandleResolution._1HOUR,
  '1HOUR': IndexerCandleResolution._1HOUR,
  H4: IndexerCandleResolution._4HOURS,
  '4HOURS': IndexerCandleResolution._4HOURS,
  D1: IndexerCandleResolution._1DAY,
  '1DAY': IndexerCandleResolution._1DAY,
};

const toNumber = (value?: unknown): number | undefined => {
  if (value == null) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export function registerRestRoutes(app: FastifyInstance, service: MockDataProvider) {
  app.get('/v4/time', (_, reply) => reply.send(service.getTime()));

  app.get('/v4/height', (_, reply) => reply.send(service.getHeight()));

  app.get('/v4/screen', (request, reply) => {
    const { address } = request.query as { address?: string };
    if (!address) {
      reply.code(400).send({ error: 'address is required' });
      return;
    }
    reply.send(service.screenAddress(address));
  });

  app.get('/v4/compliance/screen/:address', (request, reply) => {
    const { address } = request.params as { address: string };
    reply.send(service.complianceScreen(address));
  });

  app.get('/v4/perpetualMarkets', async (request, reply) => {
    const { ticker } = request.query as { ticker?: string };
    const data = await Promise.resolve(service.getPerpetualMarkets(ticker));
    reply.send(data);
  });

  app.get('/v4/orderbooks/perpetualMarket/:market', (request, reply) => {
    const { market } = request.params as { market: string };
    reply.send(service.getPerpetualMarketOrderbook(market));
  });

  app.get('/v4/trades/perpetualMarket/:market', async (request, reply) => {
    const { market } = request.params as { market: string };
    const { limit, page, createdBeforeOrAt } = request.query as {
      limit?: string;
      page?: string;
      createdBeforeOrAt?: string;
    };
    const data = await Promise.resolve(
      service.getPerpetualMarketTrades(
        market,
        toNumber(limit),
        toNumber(page),
        createdBeforeOrAt
      )
    );
    reply.send(data);
  });

  app.get('/v4/candles/perpetualMarkets/:market', (request, reply) => {
    const { market } = request.params as { market: string };
    const { resolution, limit, fromISO, toISO } = request.query as {
      resolution?: string;
      limit?: string;
      fromISO?: string;
      toISO?: string;
    };
    if (!resolution) {
      reply.code(400).send({ error: 'resolution is required' });
      return;
    }
    const mappedResolution =
      RESOLUTION_MAP[resolution.toUpperCase()] ?? IndexerCandleResolution._1HOUR;
    reply.send(
      service.getPerpetualMarketCandles(
        market,
        mappedResolution,
        toNumber(limit),
        fromISO,
        toISO
      )
    );
  });

  app.get('/v4/perpetualMarkets/historicalFunding', (request, reply) => {
    const { ticker, limit, effectiveBeforeOrAt } = request.query as {
      ticker?: string;
      limit?: string;
      effectiveBeforeOrAt?: string;
    };
    reply.send(
      service.getPerpetualMarketHistoricalFunding(
        ticker,
        toNumber(limit),
        effectiveBeforeOrAt
      )
    );
  });

  app.get('/v4/sparklines', (_, reply) => reply.send(service.getSparklines()));

  app.get('/v4/addresses/:address', async (request, reply) => {
    const { address } = request.params as { address: string };
    const data = await Promise.resolve(service.getAddressOverview(address));
    reply.send(data);
  });

  app.get('/v4/addresses/:address/subaccountNumber/:subaccountNumber', async (request, reply) => {
    const { address, subaccountNumber } = request.params as { address: string; subaccountNumber: string };
    const data = await Promise.resolve(service.getSubaccount(address, Number(subaccountNumber)));
    reply.send(data);
  });

  app.get('/v4/addresses/:address/parentSubaccountNumber/:parentSubaccountNumber', (request, reply) => {
    const { address, parentSubaccountNumber } = request.params as { address: string; parentSubaccountNumber: string };
    reply.send(service.getParentSubaccount(address, Number(parentSubaccountNumber)));
  });

  app.get('/v4/perpetualPositions', async (request, reply) => {
    const { address, subaccountNumber, status, createdBeforeOrAt, limit } = request.query as {
      address?: string;
      subaccountNumber?: string;
      status?: string;
      createdBeforeOrAt?: string;
      limit?: string;
    };
    if (!address) {
      reply.code(400).send({ error: 'address is required' });
      return;
    }
    const data = await Promise.resolve(
      service.getPerpetualPositions(
        address,
        subaccountNumber != null ? Number(subaccountNumber) : undefined,
        status as IndexerPerpetualPositionStatus | undefined,
        createdBeforeOrAt,
        toNumber(limit)
      )
    );
    reply.send(data);
  });

  app.get('/v4/assetPositions', (request, reply) => {
    const { address, subaccountNumber, limit } = request.query as {
      address?: string;
      subaccountNumber?: string;
      limit?: string;
    };
    if (!address) {
      reply.code(400).send({ error: 'address is required' });
      return;
    }
    reply.send(
      service.getAssetPositions(
        address,
        subaccountNumber != null ? Number(subaccountNumber) : undefined,
        toNumber(limit)
      )
    );
  });

  app.get('/v4/orders', (request, reply) => {
    const { address, subaccountNumber } = request.query as {
      address?: string;
      subaccountNumber?: string;
    };
    if (!address || subaccountNumber == null) {
      reply.code(400).send({ error: 'address and subaccountNumber are required' });
      return;
    }
    reply.send(service.getSubaccountOrders(address, Number(subaccountNumber)));
  });

  app.get('/v4/orders/parentSubaccountNumber', (request, reply) => {
    const { address, parentSubaccountNumber } = request.query as {
      address?: string;
      parentSubaccountNumber?: string;
    };
    if (!address || parentSubaccountNumber == null) {
      reply.code(400).send({ error: 'address and parentSubaccountNumber are required' });
      return;
    }
    reply.send(service.getParentSubaccountOrders(address, Number(parentSubaccountNumber)));
  });

  app.get('/v4/orders/:orderId', (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    const order = service.getOrder(orderId);
    if (!order) {
      reply.code(404).send({ error: `Order ${orderId} not found` });
      return;
    }
    reply.send(order);
  });

  app.get('/v4/fills', (request, reply) => {
    const { address, subaccountNumber, limit, page } = request.query as {
      address?: string;
      subaccountNumber?: string;
      limit?: string;
      page?: string;
    };
    if (!address || subaccountNumber == null) {
      reply.code(400).send({ error: 'address and subaccountNumber are required' });
      return;
    }
    reply.send(
      service.getSubaccountFills(address, Number(subaccountNumber), toNumber(limit), toNumber(page))
    );
  });

  app.get('/v4/fills/parentSubaccountNumber', (request, reply) => {
    const { address, parentSubaccountNumber, limit, page } = request.query as {
      address?: string;
      parentSubaccountNumber?: string;
      limit?: string;
      page?: string;
    };
    if (!address || parentSubaccountNumber == null) {
      reply.code(400).send({ error: 'address and parentSubaccountNumber are required' });
      return;
    }
    reply.send(
      service.getParentSubaccountFills(address, Number(parentSubaccountNumber), toNumber(limit), toNumber(page))
    );
  });

  app.get('/v4/transfers', (request, reply) => {
    const { address, subaccountNumber, limit, page } = request.query as {
      address?: string;
      subaccountNumber?: string;
      limit?: string;
      page?: string;
    };
    if (!address || subaccountNumber == null) {
      reply.code(400).send({ error: 'address and subaccountNumber are required' });
      return;
    }
    reply.send(
      service.getSubaccountTransfers(address, Number(subaccountNumber), toNumber(limit), toNumber(page))
    );
  });

  app.get('/v4/transfers/parentSubaccountNumber', (request, reply) => {
    const { address, parentSubaccountNumber, limit, page } = request.query as {
      address?: string;
      parentSubaccountNumber?: string;
      limit?: string;
      page?: string;
    };
    if (!address || parentSubaccountNumber == null) {
      reply.code(400).send({ error: 'address and parentSubaccountNumber are required' });
      return;
    }
    reply.send(
      service.getParentSubaccountTransfers(address, Number(parentSubaccountNumber), toNumber(limit), toNumber(page))
    );
  });

  app.get('/v4/transfers/between', (request, reply) => {
    const {
      sourceAddress,
      sourceSubaccountNumber,
      recipientAddress,
      recipientSubaccountNumber,
    } = request.query as {
      sourceAddress?: string;
      sourceSubaccountNumber?: string;
      recipientAddress?: string;
      recipientSubaccountNumber?: string;
    };
    if (
      !sourceAddress ||
      sourceSubaccountNumber == null ||
      !recipientAddress ||
      recipientSubaccountNumber == null
    ) {
      reply.code(400).send({ error: 'source and recipient information is required' });
      return;
    }
    reply.send(
      service.getTransfersBetween(
        sourceAddress,
        Number(sourceSubaccountNumber),
        recipientAddress,
        Number(recipientSubaccountNumber)
      )
    );
  });

  app.get('/v4/fundingPayments', (request, reply) => {
    const { address, subaccountNumber, limit, page } = request.query as {
      address?: string;
      subaccountNumber?: string;
      limit?: string;
      page?: string;
    };
    if (!address || subaccountNumber == null) {
      reply.code(400).send({ error: 'address and subaccountNumber are required' });
      return;
    }
    reply.send(
      service.getSubaccountFundingPayments(address, Number(subaccountNumber), toNumber(limit), toNumber(page))
    );
  });

  app.get('/v4/fundingPayments/parentSubaccount', (request, reply) => {
    const { address, parentSubaccountNumber, limit, page } = request.query as {
      address?: string;
      parentSubaccountNumber?: string;
      limit?: string;
      page?: string;
    };
    if (!address || parentSubaccountNumber == null) {
      reply.code(400).send({ error: 'address and parentSubaccountNumber are required' });
      return;
    }
    reply.send(
      service.getParentSubaccountFundingPayments(
        address,
        Number(parentSubaccountNumber),
        toNumber(limit),
        toNumber(page)
      )
    );
  });

  app.get('/v4/historical-pnl', (request, reply) => {
    const { address, subaccountNumber, limit, page } = request.query as {
      address?: string;
      subaccountNumber?: string;
      limit?: string;
      page?: string;
    };
    if (!address || subaccountNumber == null) {
      reply.code(400).send({ error: 'address and subaccountNumber are required' });
      return;
    }
    reply.send(
      service.getSubaccountHistoricalPnl(address, Number(subaccountNumber), toNumber(limit), toNumber(page))
    );
  });

  app.get('/v4/historical-pnl/parentSubaccountNumber', (request, reply) => {
    const { address, parentSubaccountNumber, limit, page } = request.query as {
      address?: string;
      parentSubaccountNumber?: string;
      limit?: string;
      page?: string;
    };
    if (!address || parentSubaccountNumber == null) {
      reply.code(400).send({ error: 'address and parentSubaccountNumber are required' });
      return;
    }
    reply.send(
      service.getParentHistoricalPnl(
        address,
        Number(parentSubaccountNumber),
        toNumber(limit),
        toNumber(page)
      )
    );
  });

  app.get('/v4/historicalTradingRewardAggregations/:address', (request, reply) => {
    const { address } = request.params as { address: string };
    reply.send(service.getHistoricalTradingRewards(address));
  });

  app.get('/v4/historicalBlockTradingRewards/:address', (request, reply) => {
    const { address } = request.params as { address: string };
    reply.send(service.getHistoricalBlockTradingRewards(address));
  });

  app.get('/v4/vault/v1/megavault/historicalPnl', (_, reply) =>
    reply.send(service.getMegavaultHistoricalPnl())
  );

  app.get('/v4/vault/v1/megavault/positions', (_, reply) =>
    reply.send(service.getMegavaultPositions())
  );

  app.get('/v4/vault/v1/vaults/historicalPnl', (_, reply) =>
    reply.send(service.getVaultHistoricalPnl())
  );
}

