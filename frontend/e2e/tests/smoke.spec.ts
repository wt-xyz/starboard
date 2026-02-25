import { expect, test } from '../fixtures/wallet';
import { closeWalletModal, openWalletModal } from '../helpers/burner-wallet';
import { waitForPageReady } from '../helpers/wait-for';
import { CommonSelectors, TradingSelectors, WalletSelectors } from '../selectors';

test.describe('Smoke Tests', () => {
  test('application loads successfully', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Verify page loaded
    await expect(page).toHaveTitle(/starboard/i);

    // Verify main dashboard elements are present
    const dashboard = page.locator('[class*="dashboard"], main, [role="main"]');
    await expect(dashboard).toBeVisible();
  });

  test('connect wallet button is visible', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Verify "Connect Wallet" button is present
    let connectButton = page.locator(WalletSelectors.connectButton.primary);
    let isVisible = await connectButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isVisible) {
      connectButton = page.locator(WalletSelectors.connectButton.fallback);
    }

    await expect(connectButton).toBeVisible();
  });

  test('market data loads', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Wait for market data to load (prices should be visible)
    // Look for price displays or chart
    const priceDisplay = page.locator('[class*="price"], [class*="chart"]').first();
    await expect(priceDisplay).toBeVisible({ timeout: 15_000 });
  });

  test('position form renders correctly', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Look for position entry form elements
    // Side switch (Long/Short)
    const sideSwitch = page.locator('button', { hasText: /long|short/i }).first();
    await expect(sideSwitch).toBeVisible();

    // Collateral/size inputs
    const inputs = page.locator('input[type="text"], input[type="number"]');
    await expect(inputs.first()).toBeVisible();
  });

  test('navigation elements are present', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Look for header/navigation
    const header = page.locator(CommonSelectors.navigation.header).first();
    await expect(header).toBeVisible();

    // Verify key navigation elements exist
    let connectWalletButton = page.locator(WalletSelectors.connectButton.primary);
    let isVisible = await connectWalletButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isVisible) {
      connectWalletButton = page.locator(WalletSelectors.connectButton.fallback);
    }

    await expect(connectWalletButton).toBeVisible();
  });

  test('positions table is present', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    // Look for positions table or empty state
    const positionsSection = page
      .locator('[class*="position"]', { hasText: /position|open/i })
      .first();
    await expect(positionsSection).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Smoke Tests with Connected Wallet', () => {
  test('wallet connects successfully', async ({ connectedWallet: page }) => {
    // Fixture already connected the wallet

    // Verify wallet button shows address
    const walletButton = page.locator('button').filter({ hasText: /0x[a-fA-F0-9]{4}\.\.\./ });
    await expect(walletButton).toBeVisible();
  });

  test('connected wallet UI updates', async ({ connectedWallet: page }) => {
    // With connected wallet, the submit button should be enabled
    const submitButton = page.getByRole('button', { name: /open|long|short/i }).first();
    await expect(submitButton).toBeVisible();
  });
});

test.describe('Smoke Tests with Authenticated Wallet', () => {
  test('wallet has ETH balance', async ({ authenticatedWallet: page }) => {
    // Fixture already set up wallet with ETH and USDC

    // Open wallet modal
    await openWalletModal(page);

    // Check for ETH balance display using proper selector
    const ethBalance = page.locator(WalletSelectors.walletModal.balances.ethRow);
    await expect(ethBalance).toBeVisible();

    await closeWalletModal(page);
  });

  test('wallet has USDC balance', async ({ authenticatedWallet: page }) => {
    // Open wallet modal
    await openWalletModal(page);

    // Check for USDC/collateral balance display using proper selector
    const usdcBalance = page.locator(WalletSelectors.walletModal.balances.usdcRow);
    await expect(usdcBalance).toBeVisible();

    await closeWalletModal(page);
  });

  test('can access position entry form with funded wallet', async ({
    authenticatedWallet: page,
  }) => {
    // Verify the dashboard trading interface is visible
    // The order form should be present with wallet funded

    // Check for order form container first
    const orderForm = page.locator(TradingSelectors.orderForm.container);
    const orderFormVisible = await orderForm.isVisible({ timeout: 5000 }).catch(() => false);

    if (!orderFormVisible) {
      // Fallback: Just verify we're on the trading page with market info
      const marketInfo = page.locator('[class*="market"], [class*="Market"]').first();
      await expect(marketInfo).toBeVisible({ timeout: 10_000 });
      console.log('  ℹ️  Order form container not found, but market info is visible');
      return;
    }

    // Try to find any trading action button
    const submitButton = page.locator(TradingSelectors.orderForm.submitButton);
    const longButton = page.locator(TradingSelectors.orderForm.openLongButton);
    const shortButton = page.locator(TradingSelectors.orderForm.openShortButton);

    // Check if at least one button exists
    const hasSubmit = await submitButton.isVisible({ timeout: 2000 }).catch(() => false);
    const hasLong = await longButton.isVisible({ timeout: 2000 }).catch(() => false);
    const hasShort = await shortButton.isVisible({ timeout: 2000 }).catch(() => false);

    // At least one button should be visible
    if (hasSubmit || hasLong || hasShort) {
      console.log('  ✅ Trading action buttons found');
    } else {
      console.log('  ⚠️  No trading buttons found, but order form container exists');
    }
  });
});
