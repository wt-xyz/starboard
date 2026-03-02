# Liquidator

This is the liquidator component.
The off-chain service that detects positions to be liquidated
and dispatch liquidation transactions on behalf of liquidator account.

Technically, it queries the indexer and connect to a given FUEL RPC.

## Instruction

Requirements: node v22.

First install dependencies by running `pnpm install` in the project root directory.

Run

```shell
cp .env.example .env
```

and adjust the configuration in the file.

Then simply

```shell
pnpm build
pnpm process
```
