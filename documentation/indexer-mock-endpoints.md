# Mock Indexer REST Surface

This document explains how the mock indexer works (apps/indexer) and lists every REST endpoint that the `ts-sdk` calls. Use it as the reference for developing against the mock service and for extending the dataset.

## How the mocker works

- `apps/indexer/mock-server.ts` boots a single Fastify process on port `4000`.
  - **REST**: All `/v4/...` routes are registered in `apps/indexer/src/rest-routes.ts`.
  - **GraphQL**: The same fixtures are exposed via the `/graphql` endpoint so Bonsai selectors and playground users can keep using the Subgraph-like schema in `schema-clean.graphql`.
- `apps/indexer/src/mock-service.ts` owns the in-memory dataset. It deterministically generates:
  - Market metadata, orderbooks, candles, historical funding, sparklines.
  - Accounts/subaccounts, positions, asset balances.
  - Orders, fills, transfers, funding payments, historical PnL, rewards.
  - Vault positions and PnL series.
  - Utility payloads (time, height, compliance responses).
- Every REST handler simply delegates to the service. When you tweak the generators, both GraphQL and REST automatically receive the new shape.

### Running the mock indexer

```bash
pnpm --filter indexer dev     # watches and restarts on changes
# or
pnpm --filter indexer start   # single run
```

The process prints the bound address (default `http://0.0.0.0:4000`). Point the web app’s environment config to this URL for both REST and (optionally) GraphQL.

## Endpoint coverage

The table below enumerates every `ts-sdk` method, the REST path it hits, and where the mock data comes from. All handlers live in `apps/indexer/src/rest-routes.ts`.

| Module | Method | REST path | Mock data source | Notes |
| ------ | ------ | --------- | ---------------- | ----- |
| `markets` | `getPerpetualMarkets` | `GET /v4/perpetualMarkets` | `MockIndexerService.getPerpetualMarkets` | Optional `ticker` query filters mock markets. |
| `markets` | `getPerpetualMarketOrderbook` | `GET /v4/orderbooks/perpetualMarket/:market` | `createOrderbooks()` | Fixed depth of bids/asks with seeded prices. |
| `markets` | `getPerpetualMarketTrades` | `GET /v4/trades/perpetualMarket/:market` | `createTrades()` | Supports `limit`, `page`, `createdBeforeOrAt`. |
| `markets` | `getPerpetualMarketCandles` | `GET /v4/candles/perpetualMarkets/:market` | `createCandles()` | Resolution strings (`M1`, `H1`, etc.) map to `IndexerCandleResolution`. |
| `markets` | `getPerpetualMarketHistoricalFunding` | `GET /v4/perpetualMarkets/historicalFunding` | `createHistoricalFunding()` | Accepts `ticker`, `effectiveBeforeOrAt`, `limit`. |
| `markets` | `getPerpetualMarketSparklines` | `GET /v4/sparklines` | `createSparklines()` | Returns `{ [ticker]: string[] }`. |
| `account` | `getSubaccounts` | `GET /v4/addresses/:address` | `getAddressOverview()` | Returns deterministic child subaccounts. |
| `account` | `getSubaccount` | `GET /v4/addresses/:address/subaccountNumber/:subaccountNumber` | `getSubaccount()` | Wraps `IndexerSubaccountResponseObject`. |
| `account` | `getParentSubaccount` | `GET /v4/addresses/:address/parentSubaccountNumber/:parentSubaccountNumber` | `getParentSubaccount()` | Includes aggregated equity/collateral. |
| `account` | `getSubaccountPerpetualPositions` | `GET /v4/perpetualPositions` | `getPerpetualPositions()` | Supports `status`, `limit`, `createdBeforeOrAt`. |
| `account` | `getSubaccountAssetPositions` | `GET /v4/assetPositions` | `getAssetPositions()` | Optional `subaccountNumber`. |
| `account` | `getSubaccountOrders` | `GET /v4/orders` | `getSubaccountOrders()` | Returns `IndexerOrderResponseObject[]`. |
| `account` | `getParentSubaccountNumberOrders` | `GET /v4/orders/parentSubaccountNumber` | `getParentSubaccountOrders()` | Merges child orders as `IndexerCompositeOrderObject[]`. |
| `account` | `getOrder` | `GET /v4/orders/:orderId` | `getOrder()` | 404s if the id is unknown. |
| `account` | `getSubaccountFills` | `GET /v4/fills` | `getSubaccountFills()` | Pagination via `limit` + `page`. |
| `account` | `getParentSubaccountNumberFills` | `GET /v4/fills/parentSubaccountNumber` | `getParentSubaccountFills()` | Same pagination support. |
| `account` | `getTransfersBetween` | `GET /v4/transfers/between` | `getTransfersBetween()` | Builds a deterministic synthetic transfer record. |
| `account` | `getSubaccountTransfers` | `GET /v4/transfers` | `getSubaccountTransfers()` | Pagination supported. |
| `account` | `getParentSubaccountNumberTransfers` | `GET /v4/transfers/parentSubaccountNumber` | `getParentSubaccountTransfers()` | Aggregated view. |
| `account` | `getSubaccountHistoricalPNLs` | `GET /v4/historical-pnl` | `getSubaccountHistoricalPnl()` | Returns pseudo hourly ticks. |
| `account` | `getParentSubaccountNumberHistoricalPNLs` | `GET /v4/historical-pnl/parentSubaccountNumber` | `getParentHistoricalPnl()` | Sorted + paginated aggregate ticks. |
| `account` | `getHistoricalTradingRewardsAggregations` | `GET /v4/historicalTradingRewardAggregations/:address` | `getHistoricalTradingRewards()` | Weekly reward buckets. |
| `account` | `getHistoricalBlockTradingRewards` | `GET /v4/historicalBlockTradingRewards/:address` | `getHistoricalBlockTradingRewards()` | Per-block reward events. |
| `account` | `getSubaccountFundingPayments` | `GET /v4/fundingPayments` | `getSubaccountFundingPayments()` | Accepts `limit`, `page`. |
| `account` | `getParentSubaccountNumberFundingPayments` | `GET /v4/fundingPayments/parentSubaccount` | `getParentSubaccountFundingPayments()` | Aggregated payments. |
| `utility` | `getTime` | `GET /v4/time` | `getTime()` | Fixed timestamp snapshot. |
| `utility` | `getHeight` | `GET /v4/height` | `getHeight()` | Mock chain height + time. |
| `utility` | `screen` | `GET /v4/screen?address=...` | `screenAddress()` | Flags addresses ending with `00`. |
| `utility` | `complianceScreen` | `GET /v4/compliance/screen/:address` | `complianceScreen()` | Flags addresses ending with `ff`. |
| `vault` | `getMegavaultHistoricalPnl` | `GET /v4/vault/v1/megavault/historicalPnl` | `getMegavaultHistoricalPnl()` | 24 hourly ticks. |
| `vault` | `getVaultsHistoricalPnl` | `GET /v4/vault/v1/vaults/historicalPnl` | `getVaultHistoricalPnl()` | Per-market PnL series. |
| `vault` | `getMegavaultPositions` | `GET /v4/vault/v1/megavault/positions` | `getMegavaultPositions()` | Vault composition across markets. |

## Customizing the mock data

- **Markets & price series** → Edit the `MARKET_SPECS` array and helpers at the top of `apps/indexer/src/mock-service.ts`.
- **Accounts/positions/orders** → Update the builder methods (`buildSubaccountBundle`, `buildOrders`, etc.). All dependent endpoints will pick up the changes.
- **Errors/edge cases** → Add branching logic inside the REST handlers (e.g., inspect `request.headers['x-mock-mode']`) and modify the service to return special payloads.
- **GraphQL schema changes** → Adjust `schema-clean.graphql` and regenerate `createGraphSnapshot` to keep fixtures in sync.

With the mock indexer running, the UI and `ts-sdk` exercise the complete production REST surface without any client-side stubs, making it easy to iterate until the real Fuel indexer is ready.

