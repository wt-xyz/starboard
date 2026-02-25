import { Locator, Page, expect } from '@playwright/test';
import { WalletSelectors } from '../selectors';

const BURNER_WALLET_NAME = 'Burner Wallet';

// Genesis account with pre-funded ETH on local testnet
const GENESIS_PRIVATE_KEY = '0x9e42fa83bda35cbc769c4b058c721adef68011d7945d0b30165397ec6d05a53a';

/**
 * Get the connected wallet button with fallback strategy
 */
async function getConnectedWalletButton(page: Page): Promise<Locator> {
  let button = page.locator(WalletSelectors.connectedWalletButton.primary);
  const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);

  if (!isVisible) {
    button = page.locator(WalletSelectors.connectedWalletButton.fallback);
  }

  return button;
}

/**
 * Connect to the burner wallet
 */
export async function createBurnerWallet(page: Page): Promise<void> {
  console.log('  🔌 Connecting burner wallet...');

  // Clear any stored burner wallet network preferences to force it to use default
  await page.evaluate(() => {
    // Clear burner wallet network preference from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('burner') || key.includes('fuel') || key.includes('network'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  });

  // Wait for page to be fully loaded
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Check if wallet is already connected
  let existingWalletButton = page.locator(WalletSelectors.connectedWalletButton.primary);
  let isAlreadyConnected = await existingWalletButton
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (!isAlreadyConnected) {
    existingWalletButton = page.locator(WalletSelectors.connectedWalletButton.fallback);
    isAlreadyConnected = await existingWalletButton.isVisible({ timeout: 2000 }).catch(() => false);
  }

  if (isAlreadyConnected) {
    console.log('  ⚠️  Wallet already connected, disconnecting first...');
    await disconnectWallet(page);
    await page.waitForTimeout(500);
  }

  // Click "Connect Wallet" button
  let connectButton = page.locator(WalletSelectors.connectButton.primary);

  // If not found by primary selector, try fallback
  let isVisible = await connectButton.isVisible({ timeout: 2000 }).catch(() => false);
  if (!isVisible) {
    connectButton = page.locator(WalletSelectors.connectButton.fallback);
  }

  await expect(connectButton).toBeVisible({ timeout: 10_000 });
  await connectButton.click();

  // Wait for wallet connector modal to appear
  await page.waitForTimeout(500);

  // Select Burner Wallet from the list
  console.log('  🔍 Looking for Burner Wallet option...');

  const burnerWalletOption = page.locator(WalletSelectors.connectorModal.burnerWalletOption);

  await expect(burnerWalletOption).toBeVisible({ timeout: 10_000 });
  console.log('  ✅ Found Burner Wallet option');
  await burnerWalletOption.click();

  // Wait for wallet to connect
  await page.waitForTimeout(2000);

  console.log('  ✅ Burner wallet connected');
}

/**
 * Verify wallet is connected by checking if address is displayed
 */
export async function verifyWalletConnected(page: Page): Promise<void> {
  console.log('  🔍 Verifying wallet connection...');

  // Look for wallet address button in header (truncated address format: "0x1234...5678")
  const walletButton = await getConnectedWalletButton(page);
  await expect(walletButton).toBeVisible({ timeout: 10_000 });

  // Open modal to verify full address display
  await walletButton.click();
  await page.waitForTimeout(500);

  // Verify address row is visible in modal
  const addressRow = page.locator(WalletSelectors.walletModal.addressRow);
  await expect(addressRow).toBeVisible({ timeout: 5_000 });

  const addressText = await addressRow.textContent();
  console.log(`  ✅ Wallet connected: ${addressText}`);

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

/**
 * Get the wallet address from the UI
 */
export async function getWalletAddress(page: Page): Promise<string> {
  // Click wallet button to open modal
  const walletButton = await getConnectedWalletButton(page);
  await walletButton.click();

  // Wait for modal to open
  await page.waitForTimeout(500);

  // Get address from the address row in the modal
  const addressRow = page.locator(WalletSelectors.walletModal.addressRow);
  const addressText = await addressRow.textContent();

  // Close modal by clicking outside or pressing escape
  await page.keyboard.press('Escape');

  return addressText || '';
}

/**
 * Disconnect the wallet
 */
export async function disconnectWallet(page: Page): Promise<void> {
  console.log('  🔌 Disconnecting wallet...');

  try {
    // Check if wallet button exists
    const walletButton = await getConnectedWalletButton(page);
    const isVisible = await walletButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isVisible) {
      console.log('  ℹ️  Wallet already disconnected');
      return;
    }

    // Check if modal is already open
    let disconnectButton = page.locator(WalletSelectors.walletModal.disconnectButton.primary);
    const isModalOpen = await disconnectButton.isVisible({ timeout: 1000 }).catch(() => false);

    if (!isModalOpen) {
      // Modal not open, need to open it first
      console.log('  🖱️  Opening wallet modal...');
      await walletButton.click({ timeout: 5000 });
      await page.waitForTimeout(1500); // Increased wait for modal animation
    } else {
      console.log('  ℹ️  Modal already open');
      // Wait for modal to be fully stable after any animations
      await page.waitForTimeout(1000);
    }

    // Try fallback if primary not visible
    const isDisconnectVisible = await disconnectButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (!isDisconnectVisible) {
      disconnectButton = page.locator(WalletSelectors.walletModal.disconnectButton.fallback);
    }

    // Wait for button to be stable before clicking
    await expect(disconnectButton).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500); // Extra wait for stability

    // Click with force if element is still becoming unstable
    await disconnectButton.click({ force: true });

    // Wait for disconnection
    await page.waitForTimeout(1000);

    console.log('  ✅ Wallet disconnected');
  } catch (error) {
    console.log(
      '  ⚠️  Could not disconnect wallet:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Open the wallet modal
 */
export async function openWalletModal(page: Page): Promise<void> {
  const walletButton = await getConnectedWalletButton(page);
  await walletButton.click();
  await page.waitForTimeout(500);
}

/**
 * Close the wallet modal
 */
export async function closeWalletModal(page: Page): Promise<void> {
  // Check if modal is open
  const dialogOverlay = page.locator('[data-slot="dialog-overlay"]');
  const isOpen = await dialogOverlay.isVisible().catch(() => false);

  if (!isOpen) {
    console.log('  ℹ️  Modal already closed');
    return;
  }

  // Try clicking outside the modal first (more reliable than Escape)
  await dialogOverlay.click({ position: { x: 10, y: 10 }, force: true });

  // Wait for modal to close
  await page
    .waitForSelector('[data-slot="dialog-overlay"]', { state: 'hidden', timeout: 3000 })
    .catch(async () => {
      // If that didn't work, try Escape key
      console.log("  ⚠️  Click didn't close modal, trying Escape...");
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    });

  // Extra wait for animations
  await page.waitForTimeout(300);
}

/**
 * Fund burner wallet with initial ETH for gas fees
 */
export async function fundBurnerWalletForGas(page: Page): Promise<void> {
  console.log('  💸 Funding burner wallet with gas ETH...');

  // Get the burner wallet's private key from localStorage
  const burnerPrivateKey = await page.evaluate(() => {
    const privateKey = localStorage.getItem('burner-wallet-private-key');

    if (!privateKey) {
      throw new Error('Burner wallet private key not found in localStorage');
    }

    return privateKey;
  });

  // Import fuels dynamically
  const { Provider, Wallet } = await import('fuels');

  // Get the current network RPC URL from the wallet connector
  const rpcUrl = await page.evaluate(async () => {
    try {
      // Access the fuel instance
      const fuel = (window as any).fuel;
      if (!fuel) {
        console.warn('window.fuel not available, defaulting to local');
        return 'http://localhost:4000/v1/graphql';
      }

      // Get current network from wallet
      const network = await fuel.currentNetwork();
      console.log('Wallet current network:', network);
      return network.url;
    } catch (error) {
      console.warn('Failed to get wallet network:', error);
      return 'http://localhost:4000/v1/graphql';
    }
  });

  console.log(`  🌐 Wallet RPC URL: ${rpcUrl}`);

  const provider = new Provider(rpcUrl);

  // Create wallet instances
  const burnerWallet = Wallet.fromPrivateKey(burnerPrivateKey, provider);
  const genesisWallet = Wallet.fromPrivateKey(GENESIS_PRIVATE_KEY, provider);

  const fullAddress = burnerWallet.address.toB256();

  console.log(`  📍 Burner wallet address: ${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`);

  // Send 0.1 ETH to burner wallet (enough for all gas fees for testing)
  const amountToSend = 100_000_000; // 0.1 ETH in base units
  const baseAssetId = await provider.getBaseAssetId();

  console.log(`  💰 Sending ${amountToSend / 1_000_000_000} ETH for gas fees...`);

  const tx = await genesisWallet.transfer(fullAddress, amountToSend, baseAssetId);
  const result = await tx.waitForResult();

  console.log(`  📋 TX Status: ${result.status}, ID: ${result.id.slice(0, 10)}...`);

  // Verify the balance actually increased
  const newBalance = await burnerWallet.getBalance(baseAssetId);
  console.log(`  💰 Burner wallet balance after transfer: ${newBalance.format()}`);

  if (newBalance.lt(amountToSend)) {
    throw new Error(
      `Burner wallet funding failed! Expected at least ${amountToSend}, got ${newBalance.toString()}`
    );
  }

  console.log('  ✅ Burner wallet funded with ETH for gas');

  // Wait for transaction to finalize
  await page.waitForTimeout(1000);
}

/**
 * Force a balance refresh by opening and closing the wallet modal
 */
export async function refreshWalletBalance(page: Page): Promise<void> {
  console.log('  🔄 Refreshing wallet balance...');

  // Open wallet modal to trigger balance fetch
  await openWalletModal(page);
  await page.waitForTimeout(2000);

  // Close modal
  await closeWalletModal(page);
  await page.waitForTimeout(1000);

  console.log('  ✅ Balance refresh complete');
}

/**
 * Wait for ETH balance to show a minimum amount in the UI
 */
export async function waitForEthBalance(
  page: Page,
  minAmount: number = 0.001,
  timeoutMs: number = 30000
): Promise<void> {
  console.log(`  ⏳ Waiting for ETH balance >= ${minAmount} to appear in UI...`);

  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < timeoutMs) {
    attempts++;

    // Open wallet modal to check balance
    await openWalletModal(page);
    await page.waitForTimeout(1000);

    // Check ETH balance display
    const ethBalanceRow = page.locator(WalletSelectors.walletModal.balances.ethRow);
    const isVisible = await ethBalanceRow.isVisible({ timeout: 2000 }).catch(() => false);

    if (isVisible) {
      const balanceText = await ethBalanceRow.textContent();
      console.log(`  💰 Attempt ${attempts}: Balance display shows "${balanceText}"`);

      // Extract numeric value
      if (balanceText) {
        const matches = balanceText.match(/[\d,]+\.?\d*/g);
        if (matches && matches.length > 0) {
          const balanceValue = parseFloat(matches[matches.length - 1].replace(/,/g, ''));

          if (balanceValue >= minAmount) {
            console.log(`  ✅ Balance verified: ${balanceValue} ETH >= ${minAmount} ETH`);
            await closeWalletModal(page);
            return;
          }
        }
      }
    } else {
      console.log(`  ⚠️  Attempt ${attempts}: ETH balance row not visible`);
    }

    // Close modal and wait before retry
    await closeWalletModal(page);
    await page.waitForTimeout(2000);
  }

  throw new Error(
    `Timeout waiting for ETH balance >= ${minAmount} to appear in UI after ${timeoutMs}ms`
  );
}

/**
 * Wait for auto-faucet to deliver ETH to the burner wallet.
 * The auto-faucet hook triggers ~1s after wallet connection for burner wallets
 * with 0 balance on testnet/local networks.
 */
export async function waitForAutoFaucet(page: Page, timeoutMs: number = 45_000): Promise<void> {
  console.log('  ⏳ Waiting for auto-faucet to deliver ETH...');

  // Wait for the success toast from auto-faucet
  const toast = page.locator('.Toastify__toast--success', {
    hasText: /testnet ETH sent/i,
  });

  try {
    await toast.waitFor({ state: 'visible', timeout: timeoutMs });
    console.log('  ✅ Auto-faucet delivered ETH');
  } catch {
    // Toast may have already appeared and dismissed, or faucet may still be processing.
    // Check balance directly via browser context (more reliable than Node.js Provider).
    console.log('  ⚠️  Auto-faucet toast not found, checking balance in browser...');
    const balanceRaw = await page.evaluate(async () => {
      try {
        const fuel = (window as any).fuel;
        if (!fuel) return '0';
        const account = await fuel.currentAccount();
        if (!account) return '0';
        const provider = await fuel.getProvider();
        const baseAssetId = provider.getBaseAssetId();
        const balance = await account.getBalance(baseAssetId);
        return balance?.toString() ?? '0';
      } catch {
        return '0';
      }
    });
    const balance = BigInt(balanceRaw);
    if (balance > 0n) {
      console.log(`  ✅ Wallet has ETH balance: ${balance.toString()} base units`);
    } else {
      throw new Error(
        'Auto-faucet did not deliver ETH within timeout. The faucet predicate may be exhausted.'
      );
    }
  }

  // Small delay for state propagation
  await page.waitForTimeout(2000);
}

/**
 * Get on-chain ETH balance for the burner wallet (Node.js context)
 */
async function getOnChainBalance(page: Page): Promise<bigint> {
  const privateKey = await page.evaluate(() => localStorage.getItem('burner-wallet-private-key'));
  if (!privateKey) return 0n;

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
  if (!rpcUrl) return 0n;

  const { Provider, Wallet } = await import('fuels');
  const provider = new Provider(rpcUrl);
  const wallet = Wallet.fromPrivateKey(privateKey, provider);
  const baseAssetId = await provider.getBaseAssetId();
  const balance = await wallet.getBalance(baseAssetId);
  return BigInt(balance.toString());
}

/**
 * Complete burner wallet setup: connect, fund for gas, and verify
 *
 * On testnet: relies on auto-faucet predicate (no genesis wallet available).
 * On local: uses genesis wallet for direct funding.
 */
export async function setupBurnerWallet(page: Page, skipFunding: boolean = false): Promise<void> {
  await createBurnerWallet(page);
  await verifyWalletConnected(page);
  console.log('  ✅ Burner wallet initialized');

  if (skipFunding) {
    console.log('  ℹ️  Skipping funding');
    return;
  }

  // Detect which network the wallet is connected to
  const rpcUrl: string = await page.evaluate(async () => {
    try {
      const fuel = (window as any).fuel;
      if (!fuel) return '';
      const network = await fuel.currentNetwork();
      return network?.url ?? '';
    } catch {
      return '';
    }
  });

  const isLocal = rpcUrl.includes('localhost') || rpcUrl.includes('127.0.0.1');
  console.log(`  🌐 Wallet RPC: ${rpcUrl} (${isLocal ? 'local' : 'testnet'})`);

  if (isLocal) {
    // Local: use genesis wallet for direct funding
    await fundBurnerWalletForGas(page);
    await page.waitForTimeout(1000);
  } else {
    // Testnet: wait for auto-faucet to deliver ETH from the predicate
    await waitForAutoFaucet(page);
  }
}
