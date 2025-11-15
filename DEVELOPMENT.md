# Development Guide

## Quick Start

Get the entire Starboard development environment running with these commands:

```bash
# 1. Install dependencies
pnpm install

# 2. Update Fuel toolchain to compatible versions
fuelup update
fuelup default latest

# 3. Start all services (Fuel node, database, indexer, API, frontend)
pnpm dev:all

# 4. In a new terminal, deploy contracts to your local node
pnpm dev:setup
```

**That's it!** You now have:
- ✅ Local Fuel blockchain with deployed contracts
- ✅ Indexer syncing blockchain events
- ✅ GraphQL API serving data
- ✅ Frontend connected to local node
- ✅ Test wallets with pre-funded tokens

## Prerequisites

- **Node.js** v18+ (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** - Install with: `curl -fsSL https://get.pnpm.io/install.sh | sh -`
- **Docker** - For PostgreSQL database
- **Fuelup** - Fuel toolchain manager. Install with: `curl https://install.fuel.network | sh`
- **process-compose** - Process orchestration tool. Install with:
  - macOS: `brew install process-compose`
  - Linux: See [https://github.com/F1bonacc1/process-compose](https://github.com/F1bonacc1/process-compose)

### Version Compatibility

| Component | Required Version | How to Update |
|-----------|-----------------|---------------|
| fuel-core | 0.46.0+ | `fuelup update` |
| forc | 0.70.1+ | `fuelup update` |
| fuels SDK | 0.102.0 | Included in package.json |

**Important:** Make sure you run `fuelup update` before starting development to ensure compatible versions.

## What Gets Started?

Running `pnpm dev:all` starts:
1. **PostgreSQL Database** (Docker) - Port: dynamic (check `docker ps`)
2. **Local Fuel Node** - Port: 4000
   - Fresh blockchain for development
   - Pre-funded test wallets
3. **Indexer Service** - Syncs blockchain data to database
4. **GraphQL API** - Port: 4350
5. **Frontend** - Port: 5173

## Process Compose Commands

```bash
# Start all services without TUI (recommended)
pnpm dev:all

# Or start all services with TUI (Terminal UI)
pnpm dev:all:tui

# Stop all services
# If running in TUI: Ctrl+C
# If running without TUI: process-compose down
```

## Deploying Contracts

After starting services with `pnpm dev:all`, deploy contracts in a new terminal:

```bash
pnpm dev:setup
```

This will:
1. Build all contracts
2. Generate TypeScript types
3. Deploy Stork Mock (price oracle)
4. Deploy USDC token
5. Deploy Vault and PricefeedWrapper
6. Configure the indexer with contract addresses

**Note:** If deployment fails with version mismatch errors, run `fuelup update` and restart services.

## Test Wallets

Your local Fuel node comes with pre-funded test wallets. After deployment, these addresses are available:

```typescript
// Deployer (has contracts deployed)
Address: 0x0a0da2e1d4d201cc73cd500dfd64a732f1b94e5fb2d86657ab43ff620acaefd6
PrivKey: 0x9e42fa83bda35cbc769c4b058c721adef68011d7945d0b30165397ec6d05a53a

// User Wallet 0
Address: 0xc2833c4eae8a3b056a6f21a04d1a176780d5dc9df621270c41bec86a90c3d770
PrivKey: 0x366079294383ed426ef94b9e86a8e448876a92c1ead9bbf75e6e205a6f4f570d

// User Wallet 1
Address: 0x7ab1e9d9fd10909aead61cbfd4a5ec2d80bb304f34cfa2b5a9446398e284e92c
PrivKey: 0xb978aa71a1487dc9c1f996493af73f0427cf78f560b606224e7f0089bae04c41
```

Import these into your Fuel wallet for testing.

## Service Endpoints

- **Frontend**: http://localhost:5173
- **GraphQL API**: http://localhost:4350
- **GraphQL Playground**: http://localhost:4350/graphql
- **Fuel Node Health**: http://127.0.0.1:4000/v1/health
- **Fuel Node GraphQL**: http://127.0.0.1:4000/v1/graphql

## Development Workflow

### Running Individual Services

If you need to run services individually for debugging:

```bash
# Start Fuel node only
fuel-core run --debug --db-type in-memory --port 4000

# Start database only
cd apps/indexer && docker compose up

# Start indexer only (requires database and contracts)
cd apps/indexer && node --require=dotenv/config lib/main.js

# Start GraphQL API only (requires indexer)
cd apps/indexer && npx squid-graphql-server

# Start frontend only
pnpm dev
```

### Working with Contracts

```bash
# Build contracts
pnpm nx build starboard/contracts

# Generate TypeScript types
pnpm nx gen:types starboard/contracts

# Run contract tests
pnpm nx test starboard/contracts

# Format Sway code
pnpm nx format starboard/contracts

# Clean build artifacts
pnpm nx clean starboard/contracts
```

### Working with the Indexer

```bash
# Navigate to indexer directory
cd apps/indexer

# Apply database migrations
npx squid-typeorm-migration apply

# Generate new migration after schema changes
npx squid-typeorm-codegen  # Generate entities from schema.graphql
npx squid-typeorm-migration generate  # Generate migration

# Build indexer
pnpm nx build indexer

# Start indexer (dev mode with auto-restart)
pnpm nx dev indexer
```

### Viewing Logs

Service logs are stored in `/tmp/`:
- Fuel node: `/tmp/fuel-node.log`
- Indexer: `/tmp/indexer.log`
- GraphQL API: `/tmp/graphql-server.log`
- Frontend: `/tmp/frontend.log`
- Process Compose: `/tmp/process-compose.log`

```bash
# Tail logs
tail -f /tmp/indexer.log
tail -f /tmp/graphql-server.log

# View all logs
tail -f /tmp/*.log
```

## Common Commands

```bash
# Development
pnpm dev:all         # Start all services
pnpm dev:setup       # Deploy contracts to local node

# Building
pnpm nx build starboard/contracts  # Build smart contracts
pnpm nx build indexer              # Build indexer
pnpm build                         # Build frontend

# Testing
pnpm nx test starboard/contracts   # Contract tests
pnpm test                          # Frontend tests

# Database management
cd apps/indexer
docker compose up -d               # Start database
docker compose down                # Stop database
docker compose down -v             # Stop and remove volumes (full reset)

# Check service health
curl http://127.0.0.1:4000/v1/health  # Fuel node
curl http://127.0.0.1:4350/health     # Indexer
```

## Troubleshooting

### Version Mismatch Errors

**Error:** `Unknown field "indexation" on type "NodeInfo"` or similar GraphQL errors

**Solution:**
```bash
# Update Fuel toolchain
fuelup update
fuelup default latest

# Check versions
fuel-core --version  # Should be 0.46.0+
forc --version       # Should be 0.70.1+

# Restart services
process-compose down
pnpm dev:all
```

### "Connection refused" when deploying contracts

**Problem:** Fuel node isn't running or isn't ready yet.

**Solution:**
```bash
# Check if fuel node is healthy
curl http://127.0.0.1:4000/v1/health

# If not running, start services
pnpm dev:all

# Wait ~10 seconds for node to be ready, then deploy
pnpm dev:setup
```

### Indexer not syncing

**Problem:** Indexer shows no activity or errors.

**Solution:**
```bash
# 1. Ensure contracts are deployed
pnpm dev:setup

# 2. Check indexer logs
tail -f /tmp/indexer.log

# 3. If database is stale, reset it
cd apps/indexer
docker compose down -v
docker compose up -d
npx squid-typeorm-migration apply

# 4. Restart indexer
process-compose down
pnpm dev:all
```

### Port already in use

**Error:** `EADDRINUSE` or `Address already in use`

**Solution:**
```bash
# Find what's using the port (replace 4000 with your port)
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or kill all relevant processes
pkill -9 fuel-core
pkill -9 process-compose
pkill -9 node
```

### Database connection errors

**Problem:** Indexer can't connect to PostgreSQL

**Solution:**
```bash
# Check if Docker is running
docker ps

# If not, start Docker
open --background -a Docker

# Wait for Docker to start, then restart database
cd apps/indexer
docker compose down
docker compose up -d
```

### Frontend not connecting to local node

**Problem:** Wallet shows "Network Error" or can't find contracts

**Solution:**
1. Make sure contracts are deployed: `pnpm dev:setup`
2. Check contract addresses in `deployment.local.json`
3. Make sure frontend is configured for local network
4. Clear browser cache and reload

### Reset Everything

If things are completely broken, reset everything:

```bash
# 1. Stop all services
process-compose down
pkill -9 fuel-core
pkill -9 node

# 2. Clean database
cd apps/indexer
docker compose down -v
cd ../..

# 3. Clean build artifacts
pnpm nx clean starboard/contracts
rm -rf apps/indexer/lib
rm -rf apps/indexer/db/migrations/*.js
rm deployment.local.json

# 4. Reinstall and restart
pnpm install
pnpm dev:all

# 5. In new terminal, deploy contracts
pnpm dev:setup
```

## Architecture

Starboard is a decentralized perpetuals trading platform built on Fuel:

- **Smart Contracts** (Sway)
  - `Vault` - Core trading logic, position management, liquidity
  - `PricefeedWrapper` - Price oracle adapter
  - `StorkMock` - Mock price feed for testing
  - `TestnetToken` - ERC20-like token (USDC mock)

- **Indexer** (TypeScript + Subsquid)
  - Listens to Fuel blockchain events
  - Indexes: positions, trades, payments, liquidity, prices
  - Stores data in PostgreSQL

- **GraphQL API** (Subsquid)
  - Serves indexed blockchain data
  - Provides efficient querying for frontend

- **Frontend** (React + Vite)
  - Trading interface
  - Wallet integration
  - Real-time position management

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines and code style.

## License

All code in this repository is protected under the AGPL-3.0 License.
