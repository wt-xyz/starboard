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

  // Position close/decrease dialog (Radix Dialog)
  closeDialog: {
    dialog: '[role="dialog"]',
    title: 'text=Decrease Position',

    // Slider percentage mark buttons
    percentageButtons: {
      zero: 'button:has-text("0%")',
      quarter: 'button:has-text("25%")',
      half: 'button:has-text("50%")',
      threeQuarter: 'button:has-text("75%")',
      full: 'button:has-text("100%")',
    },

    // Submit buttons (text changes based on slider percentage)
    closeButton: 'button:has-text("Close Position")',
    decreaseButton: 'button:has-text("Decrease Position")',
    cancelButton: 'button:has-text("Cancel")',
  },

  // Market selector
  marketSelector: {
    trigger: '[class*="marketSelector"], button:has-text("BTC")',
    dropdown: '[role="listbox"], [role="menu"]',
    option: '[role="option"], [role="menuitem"]',
  },
} as const;
