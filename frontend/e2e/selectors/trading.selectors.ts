/**
 * Trading-related selectors
 * Order entry form, positions, and trading UI elements
 */

export const TradingSelectors = {
  // Order entry form
  orderForm: {
    container: '[class*="orderForm"], [class*="OrderEntry"]',

    // Side selection (Radix Tabs.Trigger renders as role="tab")
    longTab: '[role="tab"]:has-text("Long")',
    shortTab: '[role="tab"]:has-text("Short")',
    sideSwitch: '[role="tablist"]',

    // Input fields
    collateralInput: 'input[placeholder*="Collateral"], input[name*="collateral"]',
    sizeInput: 'input[placeholder*="Size"], input[name*="size"]',
    leverageInput: 'input[placeholder*="Leverage"], input[name*="leverage"]',

    // Market/Limit order type
    marketTab: 'button:has-text("Market")',
    limitTab: 'button:has-text("Limit")',
    limitPriceInput: 'input[placeholder*="Price"], input[name*="price"]',

    // Submit buttons
    submitButton: 'button[type="submit"]',
    openLongButton: 'button:has-text(/open.*long/i)',
    openShortButton: 'button:has-text(/open.*short/i)',
  },

  // Positions list/table
  positions: {
    container: '[class*="position"]',
    table: 'table, [role="table"]',
    row: '[class*="positionRow"], tr',
    emptyState: 'text=/no.*position|empty/i',

    // Position card (mobile)
    card: '[class*="positionCard"]',

    // Position details within a row/card
    market: '[class*="market"]',
    side: '[class*="side"]',
    size: '[class*="size"]',
    collateral: '[class*="collateral"]',
    entryPrice: '[class*="entryPrice"]',
    markPrice: '[class*="markPrice"]',
    liquidationPrice: '[class*="liquidationPrice"]',
    pnl: '[class*="pnl"]',

    // Actions
    closeButton: 'button:has-text(/close/i)',
    decreaseButton: 'button:has-text(/decrease/i)',
    increaseButton: 'button:has-text(/increase/i)',
  },

  // Position close/decrease dialog
  closeDialog: {
    dialog: '[role="dialog"]',
    title: 'text=/close|decrease.*position/i',

    // Close options
    closeFullButton: 'button:has-text(/close.*full|100%/i)',
    closeHalfButton: 'button:has-text(/50%/i)',
    closePercentInput: 'input[type="number"], input[type="text"]',

    // Confirm/submit
    confirmButton: 'button:has-text(/confirm|close|submit/i)',
    cancelButton: 'button:has-text(/cancel/i)',
  },

  // Market selector
  marketSelector: {
    trigger: '[class*="marketSelector"], button:has-text("BTC")',
    dropdown: '[role="listbox"], [role="menu"]',
    option: '[role="option"], [role="menuitem"]',
  },
} as const;
