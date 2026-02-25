# Starboard E2E Tests

Comprehensive Playwright end-to-end tests for the Starboard trading platform.

## Quick Start

### Prerequisites

1. **Start the development server in DEV mode** in a separate terminal:

   ```bash
   cd frontend
   # IMPORTANT: Must run in dev mode to enable network switcher and local network
   NODE_ENV=development VITE_ENV=dev pnpm dev
   # OR simply:
   pnpm dev
   ```

   **Note:** The dev server MUST run in development mode for e2e tests. This enables:

   - Network switcher UI
   - Local network selection
   - Burner wallet option
   - Test/dev features

2. **Ensure Docker services are running**:

   ```bash
   cd docker
   docker compose up -d
   ```

3. **Install Playwright browsers** (first time only):
   ```bash
   cd frontend
   pnpm playwright:install
   ```

### Running Tests

```bash
# Run all tests against local testnet
cd frontend
pnpm test:e2e:local

# Run tests against remote testnet
pnpm test:e2e:testnet

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run tests in debug mode
pnpm test:e2e:debug

# Run tests in headed mode (see browser)
pnpm test:e2e:headed
```

## Architecture

### Screenplay Pattern

This test suite follows the **Screenplay pattern** to maximize maintainability. All UI selectors are centralized in dedicated files, so when the UI changes, you only need to update selectors in ONE place.

```
e2e/
├── selectors/              # Centralized UI selectors
│   ├── wallet.selectors.ts
│   ├── trading.selectors.ts
│   ├── common.selectors.ts
│   └── index.ts
├── helpers/                # Reusable test helpers
│   ├── burner-wallet.ts
│   ├── faucet.ts
│   └── wait-for.ts
├── fixtures/               # Playwright fixtures
│   ├── base.ts
│   └── wallet.ts
└── tests/                  # Test specifications
    ├── setup.spec.ts
    ├── positions.spec.ts
    ├── network.spec.ts
    └── smoke.spec.ts
```

**See [`SCREENPLAY_PATTERN.md`](./SCREENPLAY_PATTERN.md) for detailed documentation on this architecture.**

## Environment Configuration

### Local Testnet (`.env.e2e.local`)

Used for testing against local Docker environment:

```env
VITE_DEFAULT_ENVIRONMENT=local
VITE_RPC_URLS={"local":"http://localhost:4000/v1/graphql","testnet":"...","mainnet":"..."}
VITE_INDEXER_URLS={"local":"http://localhost:4350/graphql","testnet":"...","mainnet":"..."}
VITE_CHAIN_IDS={"local":"0","testnet":"0","mainnet":"9889"}
# ... contract IDs ...
VITE_ETH_FAUCET_PIN=0x86B66DaccF66BAf63D9BE78426CC1f9313fa3d3A5C5C3A0F94F9e87223365C5f
```

**Important:** All three networks (local, testnet, mainnet) must be defined in the JSON environment variables, even if you're only testing on local. This is required by the frontend's Zod validation.

### Remote Testnet (`.env.e2e.testnet`)

Used for testing against remote Fuel testnet:

```env
VITE_DEFAULT_ENVIRONMENT=testnet
# ... similar structure with testnet URLs ...
```

## Test Suites

### 1. Network Tests (`network.spec.ts`)

Tests network switching and configuration:

- Network switcher visibility
- Current network display
- Network indicator shows correct chain ID
- RPC and Indexer URL validation
- Contract ID configuration

**Status:** ✅ All passing (10 tests)

### 2. Setup Tests (`setup.spec.ts`)

Tests wallet setup flow:

- Burner wallet connection
- Wallet disconnection
- Wallet modal display
- ETH faucet requests (currently disabled due to predicate compatibility)
- USDC minting

**Status:** ⚠️ Partially passing (wallet connection works, predicate faucet has version compatibility issues)

### 3. Position Trading Tests (`positions.spec.ts`)

Tests core trading functionality:

- Opening long positions
- Opening short positions
- Closing positions (full and partial)
- Position details display
- Insufficient collateral handling

**Status:** 🔄 In progress

### 4. Smoke Tests (`smoke.spec.ts`)

Basic application health checks:

- Application loads
- Key UI elements render
- Market data displays

**Status:** 🔄 In progress

## Test Approach

### Burner Wallet Strategy

All tests use the **Burner Wallet** approach for simplicity:

1. **Connect burner wallet** - Creates a new in-browser wallet
2. **Fund with ETH** - Genesis account sends 0.1 ETH for gas fees
3. **Mint USDC** - Use gas ETH to mint test USDC collateral
4. **Execute tests** - Wallet is ready for trading operations

This approach avoids complex wallet management and provides clean test isolation.

### Genesis Account Funding

The burner wallet is automatically funded with 0.1 ETH from the genesis account (pre-funded on local testnet) to pay for transaction gas fees. This happens transparently in the `setupBurnerWallet()` helper function.

```typescript
// Genesis account private key (local testnet only)
const GENESIS_PRIVATE_KEY = '0x9e42fa83bda35cbc769c4b058c721adef68011d7945d0b30165397ec6d05a53a';
```

## Fixtures

### `authenticatedWallet`

Provides a page with a fully set up burner wallet:

- Connected to burner wallet
- Funded with 0.1 ETH for gas
- Minted USDC collateral
- Ready for trading

```typescript
test('can open a long position', async ({ authenticatedWallet: page }) => {
  // Wallet is already set up and ready to trade
  await openPosition(page, 'long', 10);
});
```

### `connectedWallet`

Provides a page with connected wallet but no funds:

```typescript
test('wallet connection flow', async ({ connectedWallet: page }) => {
  // Wallet is connected but has no ETH or USDC
});
```

## Helpers

### Wallet Helpers (`helpers/burner-wallet.ts`)

- `createBurnerWallet(page)` - Connect to burner wallet
- `setupBurnerWallet(page)` - Connect and fund wallet
- `verifyWalletConnected(page)` - Verify connection
- `disconnectWallet(page)` - Disconnect wallet
- `openWalletModal(page)` - Open wallet modal
- `closeWalletModal(page)` - Close wallet modal
- `getWalletAddress(page)` - Get wallet address

### Faucet Helpers (`helpers/faucet.ts`)

- `mintUsdc(page, amount?)` - Mint USDC tokens
- `verifyBalance(page, asset, minAmount)` - Check balances

### Wait Helpers (`helpers/wait-for.ts`)

- `waitForToast(page, message, type)` - Wait for toast notifications
- `waitForTransaction(page)` - Wait for blockchain transactions
- `waitForPageReady(page)` - Wait for page to fully load

## Selectors

All UI selectors are centralized in `e2e/selectors/`:

```typescript
import { CommonSelectors, TradingSelectors, WalletSelectors } from '../selectors';

// Use selectors instead of hardcoded strings
const button = page.locator(WalletSelectors.connectButton.primary);
const toast = page.locator(CommonSelectors.toast.success);
```

**Benefits:**

- UI changes only require updating ONE file
- Type-safe selectors with autocomplete
- Primary + fallback selector strategy for robustness

**See [`selectors/README.md`](./selectors/README.md) for complete selector documentation.**

## Troubleshooting

### Dev Server Not Running

**Error:** `net::ERR_CONNECTION_REFUSED at http://localhost:5173/`

**Solution:**

```bash
# Start the dev server in a separate terminal
cd frontend
pnpm dev

# Wait for "Local: http://localhost:5173" message
# Then run tests
```

### Docker Services Not Running

**Error:** Connection errors to `localhost:4000` or `localhost:4350`

**Solution:**

```bash
cd docker
docker compose up -d

# Verify services are running
docker compose ps
```

### Missing Environment Variables

**Error:** `Uncaught ZodError: [...] required`

**Solution:** Ensure your `.env.e2e.local` file includes ALL required environment variables for all three networks (local, testnet, mainnet), even if you're only testing locally.

### ETH Faucet Predicate Issues

**Current Status:** The ETH faucet predicate has version compatibility issues between fuel-core 0.47.1 (running in Docker) and fuel-ts SDK 0.43.1.

**Workaround:** Tests automatically fund the burner wallet with 0.1 ETH from the genesis account, bypassing the need for the predicate faucet during testing.

## Test Results

Current status (as of 2026-02-03):

```
✅  13 passed  - Network & wallet connection tests
⏸️   5 skipped - ETH faucet predicate tests (version incompatibility)
❌  27 blocked - USDC-dependent tests (blocked by frontend balance bug)
```

**🚨 IMPORTANT:** 27 tests are currently blocked by a frontend bug in balance fetching. See [`BLOCKING_ISSUES.md`](./BLOCKING_ISSUES.md) for full details.

**Summary:** The wallet successfully receives 0.1 ETH on-chain (verified), but the UI consistently shows 0.0000 ETH. This causes USDC minting to fail with "Insufficient funds" even though the wallet has sufficient balance. Once this frontend bug is fixed, all tests should pass.

## CI Integration

**Status:** Not yet implemented (per plan requirements)

When ready to add CI:

1. Add `.github/workflows/e2e-tests.yml`
2. Start Docker services in CI
3. Run tests with `pnpm test:e2e:local`
4. Upload test artifacts on failure

## Performance Notes

- Test suite runs serially (one test at a time) for wallet state consistency
- Each test with `authenticatedWallet` takes ~15-20s for setup
- Blockchain transactions typically complete in 2-5 seconds on local testnet
- Modal animations may add 300-500ms delays
- Full suite estimated completion: < 10 minutes on local testnet

## Known Limitations

1. **Serial execution only** - Tests must run one at a time due to shared wallet state
2. **Local testnet recommended** - Remote testnet is slower and has shared state
3. **ETH faucet predicate** - Currently disabled due to version compatibility issues
4. **UI balance display** - May not update immediately after on-chain transfers (cosmetic issue only)

## Contributing

When adding new tests:

1. **Use centralized selectors** from `e2e/selectors/`
2. **Use fixtures** for common setup (`authenticatedWallet`, `connectedWallet`)
3. **Follow Screenplay pattern** - no hardcoded selectors in test files
4. **Add appropriate waits** - use `waitForToast`, `waitForTransaction`, etc.
5. **Clean up after tests** - fixtures handle wallet disconnection automatically

## Documentation

- [`SCREENPLAY_PATTERN.md`](./SCREENPLAY_PATTERN.md) - Architecture and migration guide
- [`selectors/README.md`](./selectors/README.md) - Selector documentation
- [`E2E_TEST_FIXES.md`](./E2E_TEST_FIXES.md) - History of issues fixed during implementation

## Support

For issues or questions:

1. Check this README for common troubleshooting steps
2. Review the selector documentation in `selectors/README.md`
3. Check test artifacts (screenshots, videos, traces) in `test-results/`
4. Run tests in debug mode: `pnpm test:e2e:debug`
