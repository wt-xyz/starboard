# Selectors - Screenplay Pattern

This directory contains all UI selectors for the e2e test suite, following the Screenplay pattern. By centralizing selectors, we ensure that when UI changes occur, selectors only need to be updated in one place.

## Structure

```text
selectors/
├── common.selectors.ts    # Common UI elements (toasts, navigation, etc.)
├── trading.selectors.ts   # Trading forms, positions, orders
├── wallet.selectors.ts    # Wallet connection, modal, balances
└── index.ts              # Exports all selectors
```

## Usage

### Import selectors in your helper or test file:

```typescript
import { CommonSelectors, TradingSelectors, WalletSelectors } from '../selectors';
```

### Use selectors with Playwright locators:

```typescript
// Good ✅
const connectButton = page.locator(WalletSelectors.connectButton.primary);

// Bad ❌ - Don't hardcode selectors in tests/helpers
const connectButton = page.locator('button[class*="walletButton"]');
```

## Selector Patterns

### Primary + Fallback Pattern

Many selectors include both primary and fallback options:

```typescript
export const WalletSelectors = {
  connectButton: {
    primary: 'button[class*="walletButton"]',
    fallback: 'button:has-text("Connect Wallet")',
  },
};
```

**Usage:**

```typescript
let button = page.locator(WalletSelectors.connectButton.primary);
const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);

if (!isVisible) {
  button = page.locator(WalletSelectors.connectButton.fallback);
}

await expect(button).toBeVisible();
```

### Nested Selectors

Selectors are organized hierarchically to match the UI structure:

```typescript
WalletSelectors.walletModal.balances.ethRow;
WalletSelectors.walletModal.disconnectButton.primary;
TradingSelectors.orderForm.collateralInput;
```

## Maintenance

### When UI Changes

If a UI element's selector changes:

1. **Identify the component** - Find which selector file contains the element
2. **Update the selector** - Modify only the selector definition
3. **Run tests** - All tests using that selector will automatically use the new one

### Adding New Selectors

1. Choose the appropriate file (common, trading, wallet, or create new)
2. Add the selector following the existing patterns
3. Use descriptive names that reflect the UI element's purpose
4. Consider adding both primary and fallback options for robustness

### Best Practices

- ✅ Use `const` assertions (`as const`) for selector objects
- ✅ Prefer class-based or aria-label selectors over text-based when possible
- ✅ Include fallback selectors for critical elements
- ✅ Group related selectors hierarchically
- ✅ Use descriptive names (e.g., `connectedWalletButton` vs `button1`)
- ❌ Don't duplicate selectors across files
- ❌ Don't hardcode selectors in test or helper files
- ❌ Don't use overly specific selectors that are fragile

## Benefits

- **Single source of truth** - All selectors defined in one place
- **Easy maintenance** - UI changes only require updating one file
- **Type safety** - TypeScript ensures selector references are valid
- **Reusability** - Selectors can be used across multiple tests
- **Readability** - Semantic names make tests more understandable
