{
"data": {
"**schema": {
"types": [
{
"name": "Query",
"kind": "OBJECT",
"fields": [
{
"name": "accounts",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "accountById",
"type": {
"name": "Account",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "accountsConnection",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "AccountsConnection",
"kind": "OBJECT"
}
}
},
{
"name": "positions",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "positionById",
"type": {
"name": "Position",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "positionsConnection",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "PositionsConnection",
"kind": "OBJECT"
}
}
},
{
"name": "markets",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "marketById",
"type": {
"name": "Market",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "marketsConnection",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "MarketsConnection",
"kind": "OBJECT"
}
}
},
{
"name": "trades",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "tradeById",
"type": {
"name": "Trade",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "tradesConnection",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "TradesConnection",
"kind": "OBJECT"
}
}
},
{
"name": "payments",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "paymentById",
"type": {
"name": "Payment",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "paymentsConnection",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "PaymentsConnection",
"kind": "OBJECT"
}
}
},
{
"name": "assets",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "assetById",
"type": {
"name": "Asset",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "assetsConnection",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "AssetsConnection",
"kind": "OBJECT"
}
}
},
{
"name": "squidStatus",
"type": {
"name": "SquidStatus",
"kind": "OBJECT",
"ofType": null
}
}
]
},
{
"name": "Int",
"kind": "SCALAR",
"fields": null
},
{
"name": "String",
"kind": "SCALAR",
"fields": null
},
{
"name": "Account",
"kind": "OBJECT",
"fields": [
{
"name": "id",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "address",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "subaccountNumber",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "subaccountId",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "isLiquidator",
"type": {
"name": "Boolean",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "isHandler",
"type": {
"name": "Boolean",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "isManager",
"type": {
"name": "Boolean",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "positions",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
}
]
},
{
"name": "Boolean",
"kind": "SCALAR",
"fields": null
},
{
"name": "Position",
"kind": "OBJECT",
"fields": [
{
"name": "id",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "status",
"type": {
"name": "PositionStatus",
"kind": "ENUM",
"ofType": null
}
},
{
"name": "side",
"type": {
"name": "PositionSide",
"kind": "ENUM",
"ofType": null
}
},
{
"name": "size",
"type": {
"name": "BigInt",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "maxSize",
"type": {
"name": "BigInt",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "entryPrice",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "exitPrice",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "realizedPnl",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "createdAt",
"type": {
"name": "DateTime",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "createdAtHeight",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "sumOpen",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "sumClose",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "netFunding",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "unrealizedPnl",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "closedAt",
"type": {
"name": "DateTime",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "subaccountNumber",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "ticker",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "collateral",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "positionFees",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "entryFundingRate",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "reserveAmount",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "lastIncreasedTime",
"type": {
"name": "DateTime",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "account",
"type": {
"name": "Account",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "market",
"type": {
"name": "Market",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "trades",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "payments",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
}
]
},
{
"name": "PositionStatus",
"kind": "ENUM",
"fields": null
},
{
"name": "PositionSide",
"kind": "ENUM",
"fields": null
},
{
"name": "BigInt",
"kind": "SCALAR",
"fields": null
},
{
"name": "BigDecimal",
"kind": "SCALAR",
"fields": null
},
{
"name": "DateTime",
"kind": "SCALAR",
"fields": null
},
{
"name": "Market",
"kind": "OBJECT",
"fields": [
{
"name": "id",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "atomicResolution",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
},
{
"name": "baseOpenInterest",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "defaultFundingRate1H",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "initialMarginFraction",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "maintenanceMarginFraction",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "marketType",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "MarketType",
"kind": "ENUM"
}
}
},
{
"name": "nextFundingRate",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "openInterest",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "openInterestLowerCap",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "openInterestUpperCap",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "oraclePrice",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "priceChange24H",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "quantumConversionExponent",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
},
{
"name": "status",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "MarketStatus",
"kind": "ENUM"
}
}
},
{
"name": "stepBaseQuantums",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigInt",
"kind": "SCALAR"
}
}
},
{
"name": "stepSize",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "subticksPerTick",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
},
{
"name": "tickSize",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "ticker",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "trades24H",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "volume24H",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "BigDecimal",
"kind": "SCALAR"
}
}
},
{
"name": "clobPairId",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "positions",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "trades",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "candles",
"type": {
"name": null,
"kind": "LIST",
"ofType": {
"name": null,
"kind": "NON_NULL"
}
}
},
{
"name": "payments",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
}
]
},
{
"name": "MarketType",
"kind": "ENUM",
"fields": null
},
{
"name": "MarketStatus",
"kind": "ENUM",
"fields": null
},
{
"name": "PositionWhereInput",
"kind": "INPUT_OBJECT",
"fields": null
},
{
"name": "AccountWhereInput",
"kind": "INPUT_OBJECT",
"fields": null
},
{
"name": "MarketWhereInput",
"kind": "INPUT_OBJECT",
"fields": null
},
{
"name": "TradeWhereInput",
"kind": "INPUT_OBJECT",
"fields": null
},
{
"name": "OrderSide",
"kind": "ENUM",
"fields": null
},
{
"name": "TradeType",
"kind": "ENUM",
"fields": null
},
{
"name": "PaymentWhereInput",
"kind": "INPUT_OBJECT",
"fields": null
},
{
"name": "PaymentType",
"kind": "ENUM",
"fields": null
},
{
"name": "PositionOrderByInput",
"kind": "ENUM",
"fields": null
},
{
"name": "Trade",
"kind": "OBJECT",
"fields": [
{
"name": "id",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "createdAtHeight",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
},
{
"name": "createdAt",
"type": {
"name": "DateTime",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "side",
"type": {
"name": "OrderSide",
"kind": "ENUM",
"ofType": null
}
},
{
"name": "price",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "size",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "tradeType",
"type": {
"name": "TradeType",
"kind": "ENUM",
"ofType": null
}
},
{
"name": "market",
"type": {
"name": "Market",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "position",
"type": {
"name": "Position",
"kind": "OBJECT",
"ofType": null
}
}
]
},
{
"name": "TradeOrderByInput",
"kind": "ENUM",
"fields": null
},
{
"name": "Candle",
"kind": "OBJECT",
"fields": [
{
"name": "id",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "ticker",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "resolution",
"type": {
"name": "CandleResolution",
"kind": "ENUM",
"ofType": null
}
},
{
"name": "startedAt",
"type": {
"name": "DateTime",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "open",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "close",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "high",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "low",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "baseTokenVolume",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "usdVolume",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "startingOpenInterest",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "market",
"type": {
"name": "Market",
"kind": "OBJECT",
"ofType": null
}
}
]
},
{
"name": "CandleResolution",
"kind": "ENUM",
"fields": null
},
{
"name": "Payment",
"kind": "OBJECT",
"fields": [
{
"name": "id",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "createdAt",
"type": {
"name": "DateTime",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "createdAtHeight",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "ticker",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "oraclePrice",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "size",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "side",
"type": {
"name": "PositionSide",
"kind": "ENUM",
"ofType": null
}
},
{
"name": "rate",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "payment",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "subaccountNumber",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "fundingIndex",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "type",
"type": {
"name": "PaymentType",
"kind": "ENUM",
"ofType": null
}
},
{
"name": "position",
"type": {
"name": "Position",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "market",
"type": {
"name": "Market",
"kind": "OBJECT",
"ofType": null
}
}
]
},
{
"name": "PaymentOrderByInput",
"kind": "ENUM",
"fields": null
},
{
"name": "AccountOrderByInput",
"kind": "ENUM",
"fields": null
},
{
"name": "AccountsConnection",
"kind": "OBJECT",
"fields": [
{
"name": "edges",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "pageInfo",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "PageInfo",
"kind": "OBJECT"
}
}
},
{
"name": "totalCount",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "AccountEdge",
"kind": "OBJECT",
"fields": [
{
"name": "node",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Account",
"kind": "OBJECT"
}
}
},
{
"name": "cursor",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "PageInfo",
"kind": "OBJECT",
"fields": [
{
"name": "hasNextPage",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Boolean",
"kind": "SCALAR"
}
}
},
{
"name": "hasPreviousPage",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Boolean",
"kind": "SCALAR"
}
}
},
{
"name": "startCursor",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "endCursor",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "PositionsConnection",
"kind": "OBJECT",
"fields": [
{
"name": "edges",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "pageInfo",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "PageInfo",
"kind": "OBJECT"
}
}
},
{
"name": "totalCount",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "PositionEdge",
"kind": "OBJECT",
"fields": [
{
"name": "node",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Position",
"kind": "OBJECT"
}
}
},
{
"name": "cursor",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "MarketOrderByInput",
"kind": "ENUM",
"fields": null
},
{
"name": "MarketsConnection",
"kind": "OBJECT",
"fields": [
{
"name": "edges",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "pageInfo",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "PageInfo",
"kind": "OBJECT"
}
}
},
{
"name": "totalCount",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "MarketEdge",
"kind": "OBJECT",
"fields": [
{
"name": "node",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Market",
"kind": "OBJECT"
}
}
},
{
"name": "cursor",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "TradesConnection",
"kind": "OBJECT",
"fields": [
{
"name": "edges",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "pageInfo",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "PageInfo",
"kind": "OBJECT"
}
}
},
{
"name": "totalCount",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "TradeEdge",
"kind": "OBJECT",
"fields": [
{
"name": "node",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Trade",
"kind": "OBJECT"
}
}
},
{
"name": "cursor",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "PaymentsConnection",
"kind": "OBJECT",
"fields": [
{
"name": "edges",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "pageInfo",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "PageInfo",
"kind": "OBJECT"
}
}
},
{
"name": "totalCount",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "PaymentEdge",
"kind": "OBJECT",
"fields": [
{
"name": "node",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Payment",
"kind": "OBJECT"
}
}
},
{
"name": "cursor",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "Asset",
"kind": "OBJECT",
"fields": [
{
"name": "id",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "decimals",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "whitelisted",
"type": {
"name": "Boolean",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "stable",
"type": {
"name": "Boolean",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "shortable",
"type": {
"name": "Boolean",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "minProfitBasisPoints",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "weight",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "feedId",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "price",
"type": {
"name": "BigDecimal",
"kind": "SCALAR",
"ofType": null
}
}
]
},
{
"name": "AssetWhereInput",
"kind": "INPUT_OBJECT",
"fields": null
},
{
"name": "AssetOrderByInput",
"kind": "ENUM",
"fields": null
},
{
"name": "AssetsConnection",
"kind": "OBJECT",
"fields": [
{
"name": "edges",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "pageInfo",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "PageInfo",
"kind": "OBJECT"
}
}
},
{
"name": "totalCount",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Int",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "AssetEdge",
"kind": "OBJECT",
"fields": [
{
"name": "node",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Asset",
"kind": "OBJECT"
}
}
},
{
"name": "cursor",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
}
]
},
{
"name": "SquidStatus",
"kind": "OBJECT",
"fields": [
{
"name": "height",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "hash",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "finalizedHeight",
"type": {
"name": "Int",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "finalizedHash",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
}
]
},
{
"name": "**Schema",
"kind": "OBJECT",
"fields": [
{
"name": "description",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "types",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "queryType",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "__Type",
"kind": "OBJECT"
}
}
},
{
"name": "mutationType",
"type": {
"name": "__Type",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "subscriptionType",
"type": {
"name": "__Type",
"kind": "OBJECT",
"ofType": null
}
},
{
"name": "directives",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
}
]
},
{
"name": "**Type",
"kind": "OBJECT",
"fields": [
{
"name": "kind",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "**TypeKind",
"kind": "ENUM"
}
}
},
{
"name": "name",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "description",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "specifiedByUrl",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "fields",
"type": {
"name": null,
"kind": "LIST",
"ofType": {
"name": null,
"kind": "NON_NULL"
}
}
},
{
"name": "interfaces",
"type": {
"name": null,
"kind": "LIST",
"ofType": {
"name": null,
"kind": "NON_NULL"
}
}
},
{
"name": "possibleTypes",
"type": {
"name": null,
"kind": "LIST",
"ofType": {
"name": null,
"kind": "NON_NULL"
}
}
},
{
"name": "enumValues",
"type": {
"name": null,
"kind": "LIST",
"ofType": {
"name": null,
"kind": "NON_NULL"
}
}
},
{
"name": "inputFields",
"type": {
"name": null,
"kind": "LIST",
"ofType": {
"name": null,
"kind": "NON_NULL"
}
}
},
{
"name": "ofType",
"type": {
"name": "**Type",
"kind": "OBJECT",
"ofType": null
}
}
]
},
{
"name": "**TypeKind",
"kind": "ENUM",
"fields": null
},
{
"name": "**Field",
"kind": "OBJECT",
"fields": [
{
"name": "name",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "description",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "args",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "type",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "**Type",
"kind": "OBJECT"
}
}
},
{
"name": "isDeprecated",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Boolean",
"kind": "SCALAR"
}
}
},
{
"name": "deprecationReason",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
}
]
},
{
"name": "**InputValue",
"kind": "OBJECT",
"fields": [
{
"name": "name",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "description",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "type",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "**Type",
"kind": "OBJECT"
}
}
},
{
"name": "defaultValue",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "isDeprecated",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Boolean",
"kind": "SCALAR"
}
}
},
{
"name": "deprecationReason",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
}
]
},
{
"name": "**EnumValue",
"kind": "OBJECT",
"fields": [
{
"name": "name",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "description",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "isDeprecated",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Boolean",
"kind": "SCALAR"
}
}
},
{
"name": "deprecationReason",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
}
]
},
{
"name": "**Directive",
"kind": "OBJECT",
"fields": [
{
"name": "name",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "String",
"kind": "SCALAR"
}
}
},
{
"name": "description",
"type": {
"name": "String",
"kind": "SCALAR",
"ofType": null
}
},
{
"name": "isRepeatable",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": "Boolean",
"kind": "SCALAR"
}
}
},
{
"name": "locations",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
},
{
"name": "args",
"type": {
"name": null,
"kind": "NON_NULL",
"ofType": {
"name": null,
"kind": "LIST"
}
}
}
]
},
{
"name": "\_\_DirectiveLocation",
"kind": "ENUM",
"fields": null
}
],
"queryType": {
"name": "Query",
"fields": [
{
"name": "accounts",
"args": [
{
"name": "where",
"type": {
"name": "AccountWhereInput"
}
},
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "offset",
"type": {
"name": "Int"
}
},
{
"name": "limit",
"type": {
"name": "Int"
}
}
]
},
{
"name": "accountById",
"args": [
{
"name": "id",
"type": {
"name": null
}
}
]
},
{
"name": "accountsConnection",
"args": [
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "after",
"type": {
"name": "String"
}
},
{
"name": "first",
"type": {
"name": "Int"
}
},
{
"name": "where",
"type": {
"name": "AccountWhereInput"
}
}
]
},
{
"name": "positions",
"args": [
{
"name": "where",
"type": {
"name": "PositionWhereInput"
}
},
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "offset",
"type": {
"name": "Int"
}
},
{
"name": "limit",
"type": {
"name": "Int"
}
}
]
},
{
"name": "positionById",
"args": [
{
"name": "id",
"type": {
"name": null
}
}
]
},
{
"name": "positionsConnection",
"args": [
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "after",
"type": {
"name": "String"
}
},
{
"name": "first",
"type": {
"name": "Int"
}
},
{
"name": "where",
"type": {
"name": "PositionWhereInput"
}
}
]
},
{
"name": "markets",
"args": [
{
"name": "where",
"type": {
"name": "MarketWhereInput"
}
},
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "offset",
"type": {
"name": "Int"
}
},
{
"name": "limit",
"type": {
"name": "Int"
}
}
]
},
{
"name": "marketById",
"args": [
{
"name": "id",
"type": {
"name": null
}
}
]
},
{
"name": "marketsConnection",
"args": [
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "after",
"type": {
"name": "String"
}
},
{
"name": "first",
"type": {
"name": "Int"
}
},
{
"name": "where",
"type": {
"name": "MarketWhereInput"
}
}
]
},
{
"name": "trades",
"args": [
{
"name": "where",
"type": {
"name": "TradeWhereInput"
}
},
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "offset",
"type": {
"name": "Int"
}
},
{
"name": "limit",
"type": {
"name": "Int"
}
}
]
},
{
"name": "tradeById",
"args": [
{
"name": "id",
"type": {
"name": null
}
}
]
},
{
"name": "tradesConnection",
"args": [
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "after",
"type": {
"name": "String"
}
},
{
"name": "first",
"type": {
"name": "Int"
}
},
{
"name": "where",
"type": {
"name": "TradeWhereInput"
}
}
]
},
{
"name": "payments",
"args": [
{
"name": "where",
"type": {
"name": "PaymentWhereInput"
}
},
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "offset",
"type": {
"name": "Int"
}
},
{
"name": "limit",
"type": {
"name": "Int"
}
}
]
},
{
"name": "paymentById",
"args": [
{
"name": "id",
"type": {
"name": null
}
}
]
},
{
"name": "paymentsConnection",
"args": [
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "after",
"type": {
"name": "String"
}
},
{
"name": "first",
"type": {
"name": "Int"
}
},
{
"name": "where",
"type": {
"name": "PaymentWhereInput"
}
}
]
},
{
"name": "assets",
"args": [
{
"name": "where",
"type": {
"name": "AssetWhereInput"
}
},
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "offset",
"type": {
"name": "Int"
}
},
{
"name": "limit",
"type": {
"name": "Int"
}
}
]
},
{
"name": "assetById",
"args": [
{
"name": "id",
"type": {
"name": null
}
}
]
},
{
"name": "assetsConnection",
"args": [
{
"name": "orderBy",
"type": {
"name": null
}
},
{
"name": "after",
"type": {
"name": "String"
}
},
{
"name": "first",
"type": {
"name": "Int"
}
},
{
"name": "where",
"type": {
"name": "AssetWhereInput"
}
}
]
},
{
"name": "squidStatus",
"args": []
}
]
}
}
}
}
