# Docker Environment Context

This note documents everything inside the `docker/` folder so Codex (or any other tooling) can reason about the local Fuel/indexer stack even when that directory is hidden on another branch.

## Purpose

The `docker/` directory provides a fully containerized local environment that mirrors the project’s on-chain dependencies:

- A Fuel node seeded with deterministic accounts and the starboard contracts.
- A Postgres instance that backs the indexer and GraphQL API.
- Two application containers (`starboard_indexer_processor` and `starboard_indexer_api`) that ingest on-chain data and serve it over GraphQL.

Running `cd docker && docker-compose up -d` is enough to boot the entire stack. Shutting down is done with `docker-compose down` (add `-v` if you intentionally want to delete the volumes/snapshot).

## Key Files

| File                    | Purpose                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.yml`    | Declares the four services (Fuel node, Postgres DB, indexer processor, indexer API), their environment variables, health checks, and exposed ports.            |
| `.env` / `.env.example` | Environment variables loaded by Compose. They define DB credentials, exposed ports, prefunded contract addresses, and helper values such as `USDC_ADDRESS`.    |
| `README.md`             | Step‑by‑step instructions for building images, starting/stopping services, deploying contracts, wallet integration, and utility commands (faucet, price feed). |
| `fuel-core/`            | Docker context for the Fuel node snapshot (`Dockerfile`, `chain_config.json`, genesis coins, wasm bytecode).                                                   |
| `starboard/`            | Docker context for the starboard app image (`Dockerfile` and `setup_starboard_contracts.sh` script used to deploy contracts after the containers come up).     |
| `genesis_coins.json`    | Source of accounts funded in the local snapshot (matches the account list in the README).                                                                      |

## Services and Ports

| Service             | Container                     | Description                                                                                                                                                                  | Ports                                                         |
| ------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Fuel node           | `starboard_fuel_core`         | Runs `fuel-core` with the bundled snapshot. Validating key is `WALLET_SECRET` from `.env`. Health check hits `/v1/health`.                                                   | Host `:${FUEL_CORE_PORT}` → container `4000`. Default `4000`. |
| Postgres            | `starboard_indexer_db`        | Stores the indexer data. Credentials `DB_{NAME,USER,PASS}` from `.env`.                                                                                                      | Host `:${DB_PORT}` → container `5432`. Default `23751`.       |
| Indexer processor   | `starboard_indexer_processor` | Runs Squid migrations then `apps/indexer/lib/main.js`, indexing the Fuel chain and writing to Postgres. Reads `VAULT_PRICEFEED_ADDRESS`, `VAULT_ADDRESS`, `FROM_BLOCK`, etc. | Internal only.                                                |
| Indexer GraphQL API | `starboard_indexer_api`       | Serves GraphQL via `squid-graphql-server` over port `4000` inside the container.                                                                                             | Host `:${GQL_PORT}` → container `4000`. Default `4350`.       |

All services assume hostnames defined by Compose (`starboard_fuel_core`, `starboard_indexer_db`) when talking to each other. Local tooling outside Docker interacts via the mapped host ports: Fuel node at `http://localhost:4000/v1/graphql`, GraphQL API at `http://localhost:4350/v1/graphql`, DB at `localhost:23751`.

## Contract Deployment Flow

1. Build images (once): `docker build -t starboard/fuel-core docker/fuel-core` and `docker build -t starboard docker/starboard`.
2. Start the stack: `cd docker && docker-compose up -d`.
3. Deploy contracts: `docker exec -t starboard_indexer_processor bash -i -c /root/setup_starboard_contracts.sh`. This script runs:
   - `pnpm deploy:stork-mock --url=http://starboard_fuel_core:4000/v1/graphql --privK=<deployer>`
   - `pnpm setup:testnet --url=http://starboard_fuel_core:4000/v1/graphql --privK=<deployer> --storkContractAddress=${VAULT_PRICEFEED_ADDRESS}`

Deployments are deterministic, so the same addresses appear every time unless contract code changes.

## Published Addresses

Pulled from `docker/README.md` and `.env` (update if contracts change):

| Description            | Address                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| Vault contract         | `0x4A1Aa5E2e2f1A6233a189f2F882a6065134fBD3133f1a1f4b8c61D275ba32615` |
| USDC contract          | `0x9534954321965C4B2dC45712AC3e7B575AFD43C38d2c9834bb5232f5F2BF2c6E` |
| USDC asset ID          | `0xda81350458510a2b4adfb85032ad319a61f271e9ccabe702c96696efc72bc6de` |
| Stork Mock             | `0x422729Dc06fD5811ec48eDf38915a52aa6383B3a2e91a7f45F1eECaAba2aEf81` |
| PricefeedWrapper       | `0x212EB3F8Ff08392B2aa030768A3814fc5A0a67F94412CfE07e37DD1cbC24F9D6` |
| VAULT_ADDRESS (`.env`) | `0x926db3Ae7909265BcAb347F45F59826FCF259Be9F915881e9Ef7D07cE29df51c` |

Prefunded accounts (from the README, use these private keys in scripts/tests):

- Deployer: `0x9e42...53a`
- User0: `0x3660...570d`
- User1: `0xb978...c41`
- Liquidator: `0xa567...8b3`
- PriceSigner: `0xb195...fe3`

## Utility Commands

- **Minting mock USDC (faucet)**

  ```
  docker exec -t \
    -e PRIV_K=<USER_PRIVATE_KEY> \
    --env-file docker/.env \
    starboard_indexer_processor \
    bash -i -c 'pnpm --filter starboard/contracts faucet --url=http://starboard_fuel_core:4000/v1/graphql --privK=${PRIV_K} --token=${USDC_ADDRESS}'
  ```

  Replace `<USER_PRIVATE_KEY>` with one of the prefunded keys; the wallet receives 1M USDC. The script lives in `contracts/tasks/faucet.ts`.

- **Feeding prices from Pyth mock data**
  ```
  docker exec -t \
    --env-file docker/.env \
    starboard_indexer_processor \
    bash -i -c 'pnpm --filter starboard/contracts prices:feed --url=http://starboard_fuel_core:4000/v1/graphql --priceSignerPrivK=${USER_PRIVATE_KEY} --mockPricefeedAddress=${VAULT_PRICEFEED_ADDRESS}'
  ```
  `USER_PRIVATE_KEY` defaults to the deployer in `.env`.

## Wallet / Frontend Integration

- Add a Fuel wallet network pointing at `http://localhost:4000/v1/graphql` with `chainId = 0`.
- Frontend defaults:
  - Indexer GraphQL: `http://localhost:4350/v1/graphql`
  - Fuel node RPC: `http://localhost:4000/v1/graphql`
  - Chain ID: `0`
  - Include Stork Mock and PricefeedWrapper addresses in any transaction that modifies positions so the VM knows which contracts are involved.

## Things Codex Should Assume

- Services persist across Git branches as long as Docker volumes are left intact (`docker-compose down` keeps them; `docker-compose down -v` wipes them).
- Contract addresses are deterministic for the provided images; regenerating images or editing contract code requires redeploying and updating `.env`.
- The Fuel faucet/private keys listed above are safe for local testing but should never touch real funds.
- Network access is entirely local—no external RPC endpoints are pulled in by default.

With this context Codex can still reason about what backend services exist, which ports to hit, and which on-chain addresses/contracts to reference even if the actual `docker/` folder is missing in a future branch.
