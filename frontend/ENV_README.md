# Environment Configuration Guide

This directory contains multiple environment configuration files for different deployment scenarios.

## Environment Files

### `.env` (Local Development)

- **Purpose**: Your local development environment
- **Git**: Not tracked (add your personal config here)
- **Default Network**: `local`
- **Environment Mode**: `dev`
- **Use Case**: Day-to-day development with local Fuel node

### `.env.example` (Template)

- **Purpose**: Template showing all required environment variables
- **Git**: Tracked (check this in)
- **Use Case**: Reference for developers setting up their local environment

### `.env.staging` (Staging/Preview Deployments)

- **Purpose**: Staging and preview deployments
- **Git**: Tracked (check this in)
- **Default Network**: `testnet`
- **Environment Mode**: `prod`
- **Use Case**: Vercel preview branches, staging deployments

### `.env.production` (Production Deployments)

- **Purpose**: Production deployments
- **Git**: Tracked (check this in)
- **Default Network**: `mainnet`
- **Environment Mode**: `prod`
- **Use Case**: Production mainnet deployment

## Environment Variables

### Core Configuration

- **`VITE_DEFAULT_ENVIRONMENT`**: Default network on app load (`local`, `testnet`, or `mainnet`)
- **`VITE_ENV`**: Application mode (`dev` or `prod`)
  - `dev`: Enables development-only features (burner wallet in dev mode, debug tools)
  - `prod`: Production mode with production-only features

### Network Configuration

All network configurations are JSON objects with keys for each network:

- **`VITE_CHAIN_IDS`**: Fuel chain IDs for each network

  ```json
  { "local": "0", "testnet": "0", "mainnet": "9889" }
  ```

- **`VITE_RPC_URLS`**: Fuel GraphQL RPC endpoints

  ```json
  {
    "local": "http://localhost:4000/v1/graphql",
    "testnet": "https://testnet.fuel.network/v1/graphql",
    "mainnet": "https://mainnet.fuel.network/v1/graphql"
  }
  ```

- **`VITE_INDEXER_URLS`**: Indexer GraphQL endpoints
  ```json
  {
    "local": "http://localhost:4350/graphql",
    "testnet": "https://starboard.squids.live/starboard-testnet@test2/api/graphql",
    "mainnet": "https://starboard.squids.live/starboard-mainnet/api/graphql"
  }
  ```

### Contract IDs

- **`VITE_VAULT_CONTRACT_IDS`**: Deployed vault contract addresses per network
- **`VITE_TESTNET_TOKEN_CONTRACT_IDS`**: Test token contract addresses (optional for mainnet)

For contracts not yet deployed, use a zero address:

```
0x0000000000000000000000000000000000000000000000000000000000000000
```

### Testnet/Local Only

- **`VITE_ETH_FAUCET_PIN`**: 32-byte hex PIN for the ETH faucet predicate (testnet/local only)

## Setup Instructions

### For Local Development

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your personal values (faucet PIN, contract IDs, etc.)

3. Start the dev server:
   ```bash
   pnpm dev
   ```

### For Deployment

Deployments automatically use the appropriate env file:

- **Vercel Production**: Uses `.env.production`
- **Vercel Preview**: Uses `.env.staging`

To test a deployment config locally:

```bash
# Load production config
pnpm build --mode production

# Load staging config
pnpm build --mode staging
```

## Network Switcher

The app includes a network switcher UI that allows users to switch between networks at runtime. The network configuration must include all three networks (`local`, `testnet`, `mainnet`) in all environment files.

### Network Availability

- **Local**: Available in all modes (for development)
- **Testnet**: Available in all modes
- **Mainnet**: Available in all modes (but is default for production)

### Burner Wallet Availability

- **Dev mode**: Available on all networks
- **Production mode**: Only available on `testnet` and `local` (excluded from mainnet for security)

## Troubleshooting

### "Invalid JSON string" error

- Check that all JSON values are properly formatted
- Restart the dev server after changing `.env` files (Vite caches env vars)

### "Contract ID cannot be empty" error

- Use zero address `0x0000...0000` for undeployed contracts, not empty strings

### Network switcher not working

- Ensure all three networks are configured in your `.env` file
- Clear browser cache and do a hard refresh

## Notes

- Environment variables are embedded at build time by Vite
- Changes to `.env` files require a dev server restart
- Never commit sensitive API keys to `.env.production` or `.env.staging`
- Use Vercel environment variables for sensitive production values
