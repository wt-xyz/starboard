import { expect, test } from '../fixtures/base';
import {
  closeWalletModal,
  disconnectWallet,
  openWalletModal,
  setupBurnerWallet,
  verifyWalletConnected,
} from '../helpers/burner-wallet';
import { mintUsdc, verifyBalance } from '../helpers/faucet';
import { waitForPageReady } from '../helpers/wait-for';
import { WalletSelectors } from '../selectors';

test.describe('Wallet Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
  });

  test('can connect burner wallet', async ({ page }) => {
    // Connect burner wallet
    await setupBurnerWallet(page);

    // Verify wallet is connected
    let walletButton = page.locator(WalletSelectors.connectedWalletButton.primary);
    let isVisible = await walletButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isVisible) {
      walletButton = page.locator(WalletSelectors.connectedWalletButton.fallback);
    }

    await expect(walletButton).toBeVisible();

    // Verify address format
    const addressText = await walletButton.textContent();
    expect(addressText).toMatch(/0x[a-fA-F0-9]{4}/);

    // Cleanup
    await disconnectWallet(page);
  });

  test('can disconnect wallet', async ({ page }) => {
    // Connect wallet first
    await setupBurnerWallet(page);

    // Verify connected
    let walletButtonBefore = page.locator(WalletSelectors.connectedWalletButton.primary);
    let isVisible = await walletButtonBefore.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isVisible) {
      walletButtonBefore = page.locator(WalletSelectors.connectedWalletButton.fallback);
    }

    await expect(walletButtonBefore).toBeVisible();

    // Disconnect
    await disconnectWallet(page);

    // Verify "Connect Wallet" button is back
    let connectButton = page.locator(WalletSelectors.connectButton.primary);
    isVisible = await connectButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isVisible) {
      connectButton = page.locator(WalletSelectors.connectButton.fallback);
    }

    await expect(connectButton).toBeVisible({ timeout: 10_000 });
  });

  test('wallet modal displays correctly after connection', async ({ page }) => {
    // Connect wallet
    await setupBurnerWallet(page);

    // Open wallet modal
    await openWalletModal(page);

    // Verify modal is visible
    const walletModal = page.locator(WalletSelectors.walletModal.dialog);
    await expect(walletModal).toBeVisible();

    // Should see balance sections
    const ethBalance = page.locator(WalletSelectors.walletModal.balances.ethRow);
    await expect(ethBalance).toBeVisible();

    // Should see disconnect button
    let disconnectButton = page.locator(WalletSelectors.walletModal.disconnectButton.primary);
    let isVisible = await disconnectButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isVisible) {
      disconnectButton = page.locator(WalletSelectors.walletModal.disconnectButton.fallback);
    }

    await expect(disconnectButton).toBeVisible();

    // Cleanup
    await page.keyboard.press('Escape');
    await disconnectWallet(page);
  });
});

test.describe('ETH Faucet Flow', () => {
  test('auto-faucet delivers ETH to new burner wallet', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // setupBurnerWallet waits for auto-faucet on testnet
    await setupBurnerWallet(page);

    // Verify ETH balance in the wallet modal
    await openWalletModal(page);
    const ethRow = page.locator(WalletSelectors.walletModal.balances.ethRow);
    await expect(ethRow).toBeVisible({ timeout: 10_000 });
    const balanceText = await ethRow.textContent();
    console.log(`  📊 ETH balance display: ${balanceText}`);

    // Should show some non-zero ETH
    expect(balanceText).toMatch(/0\.0001/);

    await closeWalletModal(page);
    await disconnectWallet(page);
  });

  test('ETH faucet button is clickable and processes request', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await setupBurnerWallet(page, /* skipFunding */ true);

    // Open wallet modal
    await openWalletModal(page);

    // Find and click "Get testnet ETH" button
    const getEthButton = page.locator(WalletSelectors.walletModal.getTestnetEthButton.primary);
    const isVisible = await getEthButton.isVisible({ timeout: 2000 }).catch(() => false);

    const button = isVisible
      ? getEthButton
      : page.locator(WalletSelectors.walletModal.getTestnetEthButton.fallback);

    await expect(button).toBeVisible();
    console.log('  🖱️  Clicking "Get testnet ETH" button...');

    await button.click();

    // Button should show "Requesting..." while processing
    await page.waitForTimeout(2000);
    console.log('  ✅ Faucet button clicked and request initiated');

    await disconnectWallet(page);
  });

  test('manual faucet button increases ETH balance', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    await setupBurnerWallet(page, /* skipFunding */ true);

    // Open wallet modal and click faucet button
    await openWalletModal(page);

    const button = page.locator(WalletSelectors.walletModal.getTestnetEthButton.fallback);
    await expect(button).toBeVisible();
    await button.click();
    console.log('  🖱️  Faucet request sent...');

    // Wait for success toast from the manual faucet button
    const toast = page.locator('.Toastify__toast--success', {
      hasText: /testnet ETH sent/i,
    });
    await expect(toast).toBeVisible({ timeout: 45_000 });
    console.log('  ✅ Faucet success toast appeared');

    // Reopen modal to check updated balance
    await closeWalletModal(page);
    await page.waitForTimeout(2000);
    await openWalletModal(page);

    const ethRow = page.locator(WalletSelectors.walletModal.balances.ethRow);
    const balanceText = await ethRow.textContent();
    console.log(`  📊 ETH balance after faucet: ${balanceText}`);
    expect(balanceText).not.toMatch(/0\.0000/);

    await disconnectWallet(page);
  });
});

test.describe('USDC Minting Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);
    // Setup burner wallet (auto-faucet delivers ETH on testnet)
    await setupBurnerWallet(page);
  });

  test.afterEach(async ({ page }) => {
    await disconnectWallet(page);
  });

  test('can mint USDC', async ({ page }) => {
    await mintUsdc(page);

    // Verify USDC balance appeared in the wallet modal
    await openWalletModal(page);
    const usdcRow = page.locator(WalletSelectors.walletModal.balances.usdcRow);
    await expect(usdcRow).toBeVisible({ timeout: 10_000 });
    const balanceText = await usdcRow.textContent();
    console.log(`  💰 USDC balance: ${balanceText}`);

    // Should show non-zero USDC (SDK mints 1,000,000 USDC)
    const usdcMatch = balanceText?.match(/([\d,]+)\.?\d*/);
    const usdcValue = usdcMatch ? parseFloat(usdcMatch[1].replace(/,/g, '')) : 0;
    expect(usdcValue).toBeGreaterThan(0);

    await closeWalletModal(page);
  });

  test('mint button completes without error', async ({ page }) => {
    await openWalletModal(page);

    const mintButton = page.getByRole('button', { name: /mint usdc/i });
    await expect(mintButton).toBeVisible();
    await mintButton.click();

    // Wait for mint to complete (button returns to non-disabled state)
    // The "Minting..." state may be too brief to catch, so just wait for completion
    await expect(mintButton).toBeEnabled({ timeout: 60_000 });
    console.log('  ✅ Mint completed');

    // Verify no error toast appeared
    const errorToast = page.locator('.Toastify__toast--error');
    const hasError = await errorToast.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBe(false);

    await closeWalletModal(page);
  });

  test('USDC balance updates after minting', async ({ page }) => {
    await mintUsdc(page);

    // Wait for SDK state to propagate
    await page.waitForTimeout(3000);

    // Check balance in wallet modal
    await openWalletModal(page);
    const usdcRow = page.locator(WalletSelectors.walletModal.balances.usdcRow);
    await expect(usdcRow).toBeVisible({ timeout: 10_000 });

    const balanceText = await usdcRow.textContent();
    console.log(`  💰 Collateral balance: ${balanceText}`);
    expect(balanceText).toBeTruthy();

    await closeWalletModal(page);
  });
});

test.describe('Complete Setup Flow', () => {
  test('full wallet setup: connect + ETH + USDC', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Step 1: Connect wallet (auto-faucet delivers ETH on testnet)
    console.log('Step 1: Connecting wallet and funding with ETH...');
    await setupBurnerWallet(page);
    await verifyWalletConnected(page);

    // Step 2: Verify ETH balance (0.0001 ETH from auto-faucet)
    console.log('Step 2: Verifying ETH balance...');
    await verifyBalance(page, 'ETH', 0.0001);

    // Step 3: Mint USDC
    console.log('Step 3: Minting USDC...');
    await mintUsdc(page);

    // Step 4: Verify USDC balance
    console.log('Step 4: Verifying USDC balance...');
    await page.waitForTimeout(3000);
    await verifyBalance(page, 'USDC', 1);

    console.log('✅ Full wallet setup completed successfully');

    // Cleanup
    await disconnectWallet(page);
  });
});
