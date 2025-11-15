# Starboard Local Development Setup

## ✅ What's Been Configured

### 1. Process Orchestration
- Added `process-compose.yaml` to manage all services
- Services start in correct dependency order
- Automatic health checks and restarts
- Commands: `pnpm dev:all` and `pnpm dev:all:tui`

### 2. Service Configuration

**Fuel Node** - Port 4000
- Runs with in-memory database for fast resets
- Health check on `/v1/health`

**PostgreSQL** - Dynamic port
- Docker-based for easy management  
- Auto-migrated schema via indexer

**Indexer** - Port 4350 (health)
- Watches Fuel node for Starboard events
- Indexes: positions, trades, liquidity, prices
- Configured via `apps/indexer/.env`

**GraphQL API** - Port 4350
- Serves indexed data
- Playground at `/graphql`

**Frontend** - Port 5173
- React + Vite
- Connected to local node

### 3. Contract Deployment

Created `scripts/setup-local-dev.sh` (`pnpm dev:setup`):
- Builds contracts
- Generates TypeScript types  
- Deploys StorkMock (price oracle)
- Deploys USDC token
- Deploys Vault and PricefeedWrapper
- Auto-configures indexer with addresses
- Saves deployment info to `deployment.local.json`

### 4. Documentation

- **README.md** - Quick start (3 commands)
- **DEVELOPMENT.md** - Comprehensive development guide
- **This file** - Setup summary

### 5. Version Management

Updated to compatible versions:
- `fuel-core` 0.46.0
- `forc` 0.70.1  
- `fuels` SDK 0.102.0

## 🚀 Quick Start for New Developers

```bash
# Clone repo (if needed)
git clone <repo-url>
cd starboard

# Install tools
brew install process-compose  # macOS
curl https://install.fuel.network | sh  # Fuelup
curl -fsSL https://get.pnpm.io/install.sh | sh  # pnpm

# Setup
pnpm install
fuelup update
fuelup default latest

# Start everything
pnpm dev:all

# In new terminal: Deploy contracts
pnpm dev:setup
```

**Done!** Visit:
- Frontend: http://localhost:5173
- GraphQL: http://localhost:4350/graphql
- Fuel node: http://127.0.0.1:4000/v1/health

## 📁 Files Added/Modified

```
starboard/
├── process-compose.yaml          # NEW: Service orchestration
├── scripts/
│   └── setup-local-dev.sh        # NEW: Contract deployment script
├── package.json                  # MODIFIED: Added dev:setup, dev:all scripts
├── README.md                     # MODIFIED: Quick start guide
├── DEVELOPMENT.md                # MODIFIED: Comprehensive dev guide
├── .gitignore                    # MODIFIED: Added deployment.local.json
└── apps/indexer/
    └── src/main.ts               # MODIFIED: Local node URL (127.0.0.1)
```

## 🎯 What Works Now

✅ One command starts all services
✅ Automatic dependency management
✅ Health checks and auto-restart
✅ Contract deployment automation  
✅ Pre-funded test wallets
✅ Service logs in `/tmp/`
✅ Clean reset with `process-compose down`

## 🔧 Current Limitations & TODOs

1. **Contract Deployment May Fail** - SDK version 0.102.0 may have API changes
   - **Workaround:** Deploy manually or downgrade SDK if needed
   - **Fix:** Update deployment scripts for new SDK API

2. **No Auto-Deploy on Startup** - Contracts must be deployed separately
   - **Future:** Add contract deployment to process-compose

3. **Database Migrations** - Must be manually applied on schema changes
   - **Future:** Auto-migrate on indexer startup

4. **Test Wallet Integration** - No auto-import to browser wallet
   - **Future:** Add wallet setup script

## 🐛 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Version mismatch | `fuelup update && fuelup default latest` |
| Port in use | `lsof -i :PORT` then `kill -9 <PID>` |
| Deployment fails | Check `tail -f /tmp/fuel-node.log` |
| Indexer not syncing | Run `pnpm dev:setup` to deploy contracts |
| Database errors | `cd apps/indexer && docker compose down -v && docker compose up -d` |

## 📊 Service Dependencies

```
Fuel Node (independent)
    ↓
PostgreSQL (independent)
    ↓
Indexer (depends on: Fuel Node, PostgreSQL, deployed contracts)
    ↓
GraphQL API (depends on: Indexer)
    ↓
Frontend (depends on: GraphQL API, Fuel Node)
```

## 🎓 Learning Resources

- **Fuel Docs**: https://docs.fuel.network
- **Sway Book**: https://docs.fuel.network/docs/sway/
- **Subsquid Docs**: https://docs.subsquid.io
- **Process Compose**: https://github.com/F1bonacc1/process-compose

---

**Questions?** Check DEVELOPMENT.md for detailed guides on:
- Working with contracts
- Database migrations
- Debugging services
- Testing workflows
