import { Page, expect } from '@playwright/test';
import { CommonSelectors, WalletSelectors } from '../selectors';
import { closeWalletModal, openWalletModal } from './burner-wallet';

const MAX_FAUCET_AMOUNT = 5_000_000n; // 0.005 ETH per request

/**
 * Get wallet balance from on-chain (runs in Node.js context, not browser)
 * Forces a fresh query by creating a new provider each time
 */
export async function getWalletBalance(
  page: Page,
  forceRefresh = true
): Promise<{ formatted: string; raw: string }> {
  // Get private key from browser localStorage
  const privateKey = await page.evaluate(() => {
    return localStorage.getItem('burner-wallet-private-key');
  });

  if (!privateKey) {
    throw new Error('No burner wallet private key found in localStorage');
  }

  // Get current network RPC URL from browser
  const rpcUrl = await page.evaluate(async () => {
    try {
      const fuel = (window as any).fuel;
      if (!fuel) return null;
      const network = await fuel.currentNetwork();
      return network?.url ?? null;
    } catch {
      return null;
    }
  });

  if (!rpcUrl) {
    throw new Error('Could not get RPC URL from wallet - window.fuel may not be ready');
  }

  // Import fuels in Node.js context (test runner)
  const { Provider, Wallet } = await import('fuels');

  // Create a fresh provider to avoid caching
  const provider = new Provider(rpcUrl);
  const wallet = Wallet.fromPrivateKey(privateKey, provider);
  const baseAssetId = await provider.getBaseAssetId();

  // Get balance with retry logic for network latency
  let balance;
  if (forceRefresh) {
    // Add small delay to ensure transaction is propagated
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  balance = await wallet.getBalance(baseAssetId);

  return {
    formatted: balance.format(),
    raw: balance.toString(),
  };
}

/**
 * Verify the predicate has sufficient ETH balance for testing
 *
 * Note: Predicate balance verification is optional - tests will fail with clear errors
 * if predicate is unfunded during actual test execution.
 */
export async function verifyPredicateBalance(
  rpcUrl: string,
  predicateAddress: string,
  minAmount: bigint
): Promise<void> {
  try {
    // Dynamic import to avoid module resolution issues at test startup
    const { Provider } = await import('fuels');
    const provider = new Provider(rpcUrl);
    const baseAssetId = await provider.getBaseAssetId();

    // Query predicate balance
    const balance = await provider.getBalance(predicateAddress, baseAssetId);

    if (balance < minAmount) {
      throw new Error(
        `ETH faucet predicate has insufficient balance.\n` +
          `  Current: ${balance.toString()} (${Number(balance) / 1e9} ETH)\n` +
          `  Required: ${minAmount.toString()} (${Number(minAmount) / 1e9} ETH)\n` +
          `  Please fund the predicate before running tests.`
      );
    }

    console.log(
      `  ✅ Predicate balance verified: ${balance.toString()} (${Number(balance) / 1e9} ETH) ` +
        `>= ${minAmount.toString()} (${Number(minAmount) / 1e9} ETH)`
    );
  } catch (error) {
    console.warn(
      '⚠️  Could not verify predicate balance:',
      error instanceof Error ? error.message : String(error)
    );
    console.warn('   Tests will continue - they will fail if predicate is unfunded');
  }
}

/**
 * Request ETH from the faucet predicate
 * Note: Does not verify balance or toast - caller should check balance if needed
 */
export async function requestEthFromFaucet(page: Page): Promise<void> {
  console.log('  💰 Requesting ETH from faucet...');

  // Open wallet modal
  await openWalletModal(page);

  // Click "Get testnet ETH" button
  let getEthButton = page.locator(WalletSelectors.walletModal.getTestnetEthButton.primary);
  const isVisible = await getEthButton.isVisible({ timeout: 2000 }).catch(() => false);

  if (!isVisible) {
    getEthButton = page.locator(WalletSelectors.walletModal.getTestnetEthButton.fallback);
  }

  await expect(getEthButton).toBeVisible();
  console.log('  🖱️  Clicking "Get testnet ETH" button...');
  await getEthButton.click();

  // Wait for transaction to process by watching for toast notification
  console.log('  ⏳ Waiting for faucet transaction to process...');
  const successToast = page.locator(CommonSelectors.toast.success);
  const errorToast = page.locator(CommonSelectors.toast.error);
  await expect(successToast.or(errorToast)).toBeVisible({ timeout: 30_000 });

  const hasError = await errorToast.isVisible({ timeout: 500 }).catch(() => false);
  if (hasError) {
    const errorText = await errorToast.textContent();
    throw new Error(`Faucet request failed: ${errorText}`);
  }

  console.log('  ✅ Faucet request completed');

  // Close modal
  await closeWalletModal(page);
}

/**
 * Mint USDC tokens
 */
export async function mintUsdc(page: Page, amount?: string): Promise<void> {
  console.log('  💵 Minting USDC...');

  // Listen for console messages and errors
  const consoleMessages: string[] = [];
  const consoleListener = (msg: any) => {
    const type = msg.type();
    const text = msg.text();
    // Capture SDK Faucet and USDC Mint logs, plus errors/warnings
    if (text.includes('[SDK Faucet]') || text.includes('[USDC Mint]')) {
      consoleMessages.push(`[${type}] ${text}`);
    } else if (
      type === 'error' ||
      type === 'warning' ||
      text.includes('error') ||
      text.includes('Error')
    ) {
      consoleMessages.push(`[${type}] ${text}`);
    }
  };
  page.on('console', consoleListener);

  // Open wallet modal if not already open
  await openWalletModal(page);

  // Click "Mint USDC" button
  let mintButton = page.locator(WalletSelectors.walletModal.mintUsdcButton.primary);
  const isVisible = await mintButton.isVisible({ timeout: 2000 }).catch(() => false);

  if (!isVisible) {
    console.log('  ⚠️  Primary mint button not visible, trying fallback...');
    mintButton = page.locator(WalletSelectors.walletModal.mintUsdcButton.fallback);
  }

  await expect(mintButton).toBeVisible();
  const buttonText = await mintButton.textContent();
  console.log(`  🖱️  Clicking "Mint USDC" button (text: "${buttonText}")...`);
  await mintButton.click();

  console.log('  ⏳ Waiting for USDC mint transaction...');

  // The SDK faucet doesn't show a toast. Wait for the button to return from
  // "Minting..." state back to its original text, indicating the TX completed.
  await expect(mintButton).not.toHaveText(/minting/i, { timeout: 60_000 });

  // Check for error toast
  const errorToast = page.locator(CommonSelectors.toast.error);
  const hasError = await errorToast.isVisible({ timeout: 2000 }).catch(() => false);
  if (hasError) {
    const errorText = await errorToast.textContent();
    page.off('console', consoleListener);
    throw new Error(`USDC mint failed: ${errorText}`);
  }

  console.log('  ✅ USDC mint transaction completed');

  if (consoleMessages.length > 0) {
    console.log(`  📋 Console messages:`, consoleMessages.slice(0, 5));
  }

  page.off('console', consoleListener);

  // Wait for balance to update
  await page.waitForTimeout(3000);

  // Close modal
  await closeWalletModal(page);
}

/**
 * Verify wallet has minimum balance of an asset
 */
export async function verifyBalance(
  page: Page,
  asset: 'ETH' | 'USDC',
  minAmount: number
): Promise<void> {
  console.log(`  🔍 Verifying ${asset} balance >= ${minAmount}...`);

  // Open wallet modal to check balances
  await openWalletModal(page);

  // Wait for balance section to load
  await page.waitForTimeout(500);

  // Find the balance row for the asset
  const balanceLocator =
    asset === 'ETH'
      ? page.locator(WalletSelectors.walletModal.balances.ethRow)
      : page.locator(WalletSelectors.walletModal.balances.usdcRow);

  await expect(balanceLocator).toBeVisible({ timeout: 10_000 });

  // Extract and verify balance value
  const balanceText = await balanceLocator.textContent();
  console.log(`  Balance display: ${balanceText}`);

  // Parse the balance value from the text
  if (!balanceText) {
    await closeWalletModal(page);
    throw new Error(`${asset} balance row has no text content`);
  }

  // For ETH: "ETH 0.0050 ETH" -> extract "0.0050"
  // For USDC: "Available Collateral 999,990.00 USDC" -> extract "999,990.00"
  const matches = balanceText.match(/[\d,]+\.?\d*/g);
  if (matches && matches.length > 0) {
    // Get the last number (the actual balance value)
    const balanceValue = parseFloat(matches[matches.length - 1].replace(/,/g, ''));
    if (balanceValue >= minAmount) {
      console.log(`  ✅ ${asset} balance verified: ${balanceValue} >= ${minAmount}`);
    } else {
      await closeWalletModal(page);
      throw new Error(`Insufficient ${asset} balance: ${balanceValue} < ${minAmount}`);
    }
  } else {
    await closeWalletModal(page);
    throw new Error(`Could not parse ${asset} balance from text: "${balanceText}"`);
  }

  // Close modal
  await closeWalletModal(page);
}

/**
 * Complete faucet setup: request ETH and mint USDC
 */
export async function setupFaucetFunds(page: Page): Promise<void> {
  await requestEthFromFaucet(page);
  await mintUsdc(page);
  await verifyBalance(page, 'ETH', 0.001);
  await verifyBalance(page, 'USDC', 1);
}
