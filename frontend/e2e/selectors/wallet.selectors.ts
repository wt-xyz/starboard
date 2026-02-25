/**
 * Wallet-related selectors following the Screenplay pattern
 * All wallet UI selectors centralized in one place for easy maintenance
 */

export const WalletSelectors = {
  // Header wallet button (when not connected)
  connectButton: {
    primary: 'button[class*="walletButton"]',
    fallback: 'button:has-text("Connect Wallet")',
  },

  // Header wallet button (when connected, shows truncated address)
  connectedWalletButton: {
    primary: 'button[class*="walletConnected"]',
    fallback: 'button:has-text(/(0x|fuel)[a-fA-F0-9]{4}/i)',
  },

  // Wallet connector modal (appears when clicking Connect)
  connectorModal: {
    heading: 'text=Connect Wallet',
    burnerWalletOption: '[aria-label="Connect to Burner Wallet"]',
  },

  // Wallet info modal (appears when clicking connected wallet)
  walletModal: {
    dialog: '[role="dialog"]',
    addressRow: 'div[class*="addressRow"]',
    disconnectButton: {
      primary: 'button[class*="disconnectButton"]',
      fallback: 'button:has-text("Disconnect")',
    },

    // Balance section
    balances: {
      // Use :first to avoid strict mode violation (ETH label appears in both label and value)
      ethRow:
        'div[class*="balanceSection"] div[class*="balanceRow"]:has(span[class*="balanceLabel"]:has-text("ETH"))',
      usdcRow:
        'div[class*="balanceSection"] div[class*="balanceRow"]:has(span[class*="balanceLabel"]:has-text("Available Collateral"))',
    },

    // Testnet tools
    getTestnetEthButton: {
      primary: 'button[class*="getTestnetEthButton"]',
      fallback: 'button:has-text("Get testnet ETH")',
    },
    mintUsdcButton: {
      primary: 'button:has-text("Mint USDC")',
      fallback: 'button:has-text(/mint.*usdc/i)',
    },
  },
} as const;
