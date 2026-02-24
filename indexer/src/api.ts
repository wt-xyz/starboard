import SimplifyInflectorPlugin from '@graphile-contrib/pg-simplify-inflector';
import * as PgAggregatesPlugin from '@graphile/pg-aggregates';
import cors from 'cors';
import express from 'express';
import { NodePlugin } from 'graphile-build';
import { createRequire } from 'module';
import pg from 'pg';
import type { PostGraphilePlugin } from 'postgraphile';
import {
  Plugin,
  embed,
  gql,
  makeExtendSchemaPlugin,
  makePluginHook,
  postgraphile,
} from 'postgraphile';
import FilterPlugin from 'postgraphile-plugin-connection-filter';

const { Pool } = pg;

const require = createRequire(import.meta.url);
const PgPubsub: PostGraphilePlugin =
  (require('@graphile/pg-pubsub') as any).default ?? require('@graphile/pg-pubsub');

const app = express();

app.use(cors());

export const ProcessorStatusPlugin: Plugin = makeExtendSchemaPlugin((_build, options) => {
  const schemas: string[] = options.stateSchemas || ['squid_processor'];

  return {
    typeDefs: gql`
      type _ProcessorStatus {
        name: String!
        height: Int!
        hash: String!
      }

      extend type Query {
        squidStatus: [_ProcessorStatus!]!
      }
    `,
    resolvers: {
      Query: {
        squidStatus: async (_parentObject, _args, context, _info) => {
          const pgClient: pg.Client = context.pgClient;

          const { rows } = await pgClient.query(
            schemas
              .map((s) => `SELECT '${s}' as name , height, hash FROM ${s}.status`)
              .join(' UNION ALL ')
          );

          return rows;
        },
      },
    },
  };
});

// Use these topics to work around PostgreSQL's 63-byte channel name limit
// The asset (66 chars) is cut to the high 42 chars for the topic name (includes the 0x prefix)
// This allows efficient filtering: each subscriber only listens to their asset's topic
function buildCurrentPriceTopic(args: { asset: string }) {
  return `starboard:price:${args.asset.substring(0, 42)}`;
}

function buildCurrentPositionTopic(args: { account: string }) {
  return `starboard:position:${args.account.substring(0, 42)}`;
}

function buildCurrentFundingInfoTopic(args: { asset: string }) {
  return `starboard:funding:${args.asset.substring(0, 42)}`;
}

function buildTradeVolume24hTopic(args: { asset: string }) {
  return `starboard:trade_24h:${args.asset.substring(0, 42)}`;
}

export const CurrentPricePlugin: Plugin = makeExtendSchemaPlugin((_build, _options) => {
  return {
    typeDefs: gql`
      type _CurrentPricePayload {
        asset: String!
        timestamp: Int!
        price: BigInt!
      }

      extend type Subscription {
        currentPriceUpdated(asset: String!): _CurrentPricePayload
          @pgSubscription(topic: ${embed(buildCurrentPriceTopic)})
      }
    `,
    resolvers: {
      Subscription: {
        currentPriceUpdated: {
          resolve: (payload, { asset }, _context, _info) => {
            // { asset }: same asset argument from the original subscription query

            // Defense in depth: verify the asset matches (in case of hash collision, though for 20 bytes it is hard)
            if (payload.asset !== asset) {
              // Unfortunately, a client will receive null, use subscribePlan to filter out properly
              return null; // Filter out non-matching events
            }

            return payload;
          },
        },
      },
    },
  };
});

export const CurrentPositionPlugin: Plugin = makeExtendSchemaPlugin((_build, _options) => {
  return {
    typeDefs: gql`
      enum PositionChange {
        INCREASE
        DECREASE
        CLOSE
        LIQUIDATE
      }

      type _CurrentPositionPayload {
        account: String!
        asset: String!
        isLong: Boolean!
        openId: String!
        positionKeyId: String!
        change: PositionChange!
      }

      extend type Subscription {
        currentPositionUpdated(account: String!): _CurrentPositionPayload
          @pgSubscription(topic: ${embed(buildCurrentPositionTopic)})
      }
    `,
    resolvers: {
      Subscription: {
        currentPositionUpdated: {
          resolve: (payload, { account }, _context, _info) => {
            // { account }: same account argument from the original subscription query

            // Defense in depth: verify the account matches (in case of hash collision, though for 20 bytes it is hard)
            if (payload.account !== account) {
              // Unfortunately, a client will receive null, use subscribePlan to filter out properly
              return null; // Filter out non-matching events
            }

            return payload;
          },
        },
      },
    },
  };
});

export const CurrentFundingInfoPlugin: Plugin = makeExtendSchemaPlugin((_build, _options) => {
  return {
    typeDefs: gql`
      type _CurrentFundingInfoPayload {
        asset: String!
        totalShortSizes: BigInt!
        totalLongSizes: BigInt!
        longCumulativeFundingRate: BigInt!
        shortCumulativeFundingRate: BigInt!
      }

      extend type Subscription {
        currentFundingInfoUpdated(asset: String!): _CurrentFundingInfoPayload
          @pgSubscription(topic: ${embed(buildCurrentFundingInfoTopic)})
      }
    `,
    resolvers: {
      Subscription: {
        currentFundingInfoUpdated: {
          resolve: (payload, { asset }, _context, _info) => {
            // { asset }: same asset argument from the original subscription query

            // Defense in depth: verify the asset matches (in case of hash collision, though for 20 bytes it is hard)
            if (payload.asset !== asset) {
              // Unfortunately, a client will receive null, use subscribePlan to filter out properly
              return null; // Filter out non-matching events
            }

            return payload;
          },
        },
      },
    },
  };
});

export const TradeVolume24hPlugin: Plugin = makeExtendSchemaPlugin((_build, _options) => {
  return {
    typeDefs: gql`
      type _TradeVolume24hPayload {
        asset: String!
        tradeVolume: BigInt!
      }

      extend type Subscription {
        tradeVolume24hUpdated(asset: String!): _TradeVolume24hPayload
          @pgSubscription(topic: ${embed(buildTradeVolume24hTopic)})
      }
    `,
    resolvers: {
      Subscription: {
        tradeVolume24hUpdated: {
          resolve: (payload, { asset }, _context, _info) => {
            // { asset }: same asset argument from the original subscription query

            // Defense in depth: verify the asset matches (in case of hash collision, though for 20 bytes it is hard)
            if (payload.asset !== asset) {
              // Unfortunately, a client will receive null, use subscribePlan to filter out properly
              return null; // Filter out non-matching events
            }

            return payload;
          },
        },
      },
    },
  };
});

app.get('/graphql', (_req, res, _next) => {
  const graphiqlPath: string =
    process.env.BASE_PATH == null ? '/graphiql' : `${process.env.BASE_PATH}/api/graphiql`;
  res.send(
    `<div>Welcome to the GraphQL API of SQD&#39;s <a href=https://github.com/subsquid-labs/squid-postgraphile-example>Postgraphile example squid</a>!</div><div><a href=${graphiqlPath}>The GraphiQL playground is here.</a></div>`
  );
});

const pluginHook = makePluginHook([PgPubsub]);

app.use(
  postgraphile(
    {
      host: process.env.DB_HOST ?? 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      database: process.env.DB_NAME ?? 'postgres',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASS ?? 'postgres',
    },
    'public',
    {
      pluginHook,
      graphiql: true,
      enhanceGraphiql: true,
      watchPg: true,
      dynamicJson: true,
      subscriptions: true,
      disableDefaultMutations: true,
      disableQueryLog: true, // set to false to see the processed queries
      skipPlugins: [NodePlugin],
      appendPlugins: [
        (PgAggregatesPlugin.default as any).default,
        FilterPlugin,
        SimplifyInflectorPlugin,
        ProcessorStatusPlugin,
        CurrentPricePlugin,
        CurrentPositionPlugin,
        CurrentFundingInfoPlugin,
        TradeVolume24hPlugin,
      ],
      externalGraphqlRoute:
        process.env.BASE_PATH == null ? undefined : `${process.env.BASE_PATH}/api/graphql`,
      graphileBuildOptions: {
        stateSchemas: ['squid_processor'],
      },
    }
  )
);

// TODO: get the connection pool from the postgraphile context
const pgPool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME ?? 'postgres',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
});

const TRADE_VOLUME_24H_INTERVAL_MS = 60_000;
let tradeVolume24hScheduler: NodeJS.Timeout | undefined;

// TODO: quering the table trade_volume_24h has poor performance, the database function has poor performance as well
function startTradeVolume24hScheduler(): NodeJS.Timeout {
  return setInterval(async () => {
    let client;
    try {
      client = await pgPool.connect();
      const { rows } = await client.query<{ index_asset_id: string; trade_volume_24h: string }>(
        `SELECT t1.index_asset_id, t1.trade_volume-COALESCE(t2.trade_volume, 0) AS trade_volume_24h FROM (SELECT index_asset_id, trade_volume FROM trade_volume WHERE (index_asset_id, timestamp) IN (SELECT index_asset_id, MAX(timestamp) FROM trade_volume GROUP BY index_asset_id)) t1 LEFT JOIN (SELECT index_asset_id, trade_volume FROM trade_volume WHERE (index_asset_id, timestamp) IN (SELECT index_asset_id, MAX(timestamp) FROM trade_volume WHERE timestamp < extract(epoch from now())-86400 GROUP BY index_asset_id)) t2 ON t1.index_asset_id = t2.index_asset_id`
      );
      for (const row of rows) {
        const topic = buildTradeVolume24hTopic({ asset: row.index_asset_id });
        const payload = JSON.stringify({
          asset: row.index_asset_id,
          tradeVolume: row.trade_volume_24h,
        });
        await client.query('SELECT pg_notify($1, $2)', [topic, payload]);
      }
    } catch (err) {
      console.error('Trade volume 24h scheduler error:', err);
    } finally {
      client?.release();
    }
  }, TRADE_VOLUME_24H_INTERVAL_MS);
}

const server = app.listen(process.env.GRAPHQL_SERVER_PORT, () => {
  console.log(`Squid API listening on port ${process.env.GRAPHQL_SERVER_PORT}`);
  tradeVolume24hScheduler = startTradeVolume24hScheduler();
});

server.on('close', () => {
  if (tradeVolume24hScheduler) {
    clearInterval(tradeVolume24hScheduler);
    tradeVolume24hScheduler = undefined;
  }
  pgPool.end().catch((err) => console.error('Error closing pgPool:', err));
});
