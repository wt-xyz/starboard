<p align="center"><img src="https://raw.githubusercontent.com/wt-xyz/starboard/8b3ee6a20850848ec4fb441a9e7b820b2cafc0b0/public/starboard-symbol-yellow.svg" width="512" /></p>

<h1 align="center">Starboard</h1>

<div align="center">

![Static Badge](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff)
![Static Badge](https://img.shields.io/badge/Monorepo-%23143055?style=flat&logo=Nx&link=https%3A%2F%2Fnx.dev%2F)
<a href="https://conventionalcommits.org">
<img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white" alt="Conventional Commits">
</a>
<a href="http://commitizen.github.io/cz-cli/">
<img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly">
</a>
<a href='https://github.com/dydxprotocol/v4-web/blob/main/LICENSE'>
<img src='https://img.shields.io/badge/License-AGPL_v3-blue.svg' alt='License' />
</a>

[![Maturity badge - level 3](https://img.shields.io/badge/Maturity-Level%203%20--%20Stable-green.svg)](https://github.com/tophat/getting-started/blob/master/scorecard.md)

</div>

## 🚀 Quick Start (3 commands!)

```bash
# 1. Install dependencies
pnpm install

# 2. Start all services  
pnpm dev:all

# 3. In a new terminal, deploy contracts
pnpm dev:setup
```

**That's it!** You now have:
- ✅ Local Fuel blockchain with deployed contracts
- ✅ Indexer syncing blockchain events
- ✅ GraphQL API serving data at http://localhost:4350
- ✅ Frontend running at http://localhost:5173
- ✅ Pre-funded test wallets ready to use

## 📖 Documentation

- **[Development Guide](./DEVELOPMENT.md)** - Detailed setup and development workflow
- **[Contracts README](./contracts/README.md)** - Smart contract documentation
- **[Indexer README](./indexer/README.md)** - Indexer setup and testing

## Prerequisites

- Node.js v18+ (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- `pnpm` (`curl -fsSL https://get.pnpm.io/install.sh | sh -`)
- Docker (for PostgreSQL)
- [Fuelup](https://install.fuel.network/) (Fuel toolchain manager)

## What Gets Started?

Running `pnpm dev:all` starts all these services automatically:

1. **Local Fuel Node** - Port 4000
   - Fresh blockchain for development
   - Pre-funded test wallets

2. **PostgreSQL Database** - Docker container
   - Stores indexed blockchain data
   - Auto-migrated schema

3. **Indexer Service**
   - Watches blockchain for Starboard events
   - Indexes: positions, trades, liquidity, prices

4. **GraphQL API** - Port 4350
   - Query indexed data
   - GraphQL playground at http://localhost:4350/graphql

5. **Frontend** - Port 5173
   - React app connected to local node
   - Hot reload enabled

## Test Wallets

Your local node comes with pre-funded test wallets:

```typescript
// Deployer (has contracts deployed)
Address: 0x0a0da2e1d4d201cc73cd500dfd64a732f1b94e5fb2d86657ab43ff620acaefd6
PrivKey: 0x9e42fa83bda35cbc769c4b058c721adef68011d7945d0b30165397ec6d05a53a

// User 0
Address: 0xc2833c4eae8a3b056a6f21a04d1a176780d5dc9df621270c41bec86a90c3d770  
PrivKey: 0x366079294383ed426ef94b9e86a8e448876a92c1ead9bbf75e6e205a6f4f570d

// User 1
Address: 0x7ab1e9d9fd10909aead61cbfd4a5ec2d80bb304f34cfa2b5a9446398e284e92c
PrivKey: 0xb978aa71a1487dc9c1f996493af73f0427cf78f560b606224e7f0089bae04c41
```

## Service Endpoints

- **Frontend**: http://localhost:5173
- **GraphQL API**: http://localhost:4350
- **GraphQL Playground**: http://localhost:4350/graphql
- **Fuel Node Health**: http://127.0.0.1:4000/v1/health
- **Fuel Node GraphQL**: http://127.0.0.1:4000/v1/graphql

## Common Commands

```bash
# Development
pnpm dev:all         # Start all services
pnpm dev:all:tui     # Start with interactive UI
pnpm dev:setup       # Deploy contracts to local node

# Building
pnpm nx build starboard/contracts  # Build smart contracts
pnpm nx build indexer              # Build indexer
pnpm build                         # Build frontend

# Testing
pnpm nx test starboard/contracts   # Contract tests
pnpm test                          # Frontend tests

# Cleanup
cd apps/indexer && docker compose down -v  # Reset database
```

## Troubleshooting

**"Connection refused" when deploying contracts?**
- Make sure `pnpm dev:all` is running first
- Check fuel node is healthy: `curl http://127.0.0.1:4000/v1/health`

**Indexer not syncing?**
- Run `pnpm dev:setup` to deploy contracts
- Check indexer logs: `tail -f /tmp/indexer.log`

**Port already in use?**
```bash
# Find what's using a port
lsof -i :4000  # or :5173, :4350

# Kill the process
kill -9 <PID>
```

**Reset everything**
```bash
# Stop all services
process-compose down  # or Ctrl+C if running in terminal

# Clean database
cd apps/indexer && docker compose down -v

# Restart
pnpm dev:all
pnpm dev:setup
```

## Architecture

Starboard is a decentralized perpetuals trading platform built on Fuel:

- **Smart Contracts** (Sway) - Vault, liquidity pools, position management
- **Indexer** (TypeScript + Subsquid) - Indexes blockchain events  
- **GraphQL API** - Serves indexed data
- **Frontend** (React + Vite) - Trading interface

## License

All code in this repository is protected under the AGPL-3.0 License.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.
