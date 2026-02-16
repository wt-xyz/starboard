import { expect, test } from '../fixtures/wallet';
import { waitForPageReady } from '../helpers/wait-for';

/**
 * Helper: Fill the order form and submit.
 * - side: 'long' | 'short'
 * - collateral: amount of USDC to pay (string)
 */
async function submitOrder(
  page: import('@playwright/test').Page,
  side: 'long' | 'short',
  collateral: string
) {
  // Click the Long/Short tab (Radix Tabs.Trigger renders as role="tab")
  const sideTab = page.getByRole('tab', { name: new RegExp(side, 'i') });
  await expect(sideTab).toBeVisible({ timeout: 10_000 });
  await sideTab.click();

  // Fill the Pay (collateral) input - it's the first input in the order form
  // The "Pay" input has a label "Pay" and placeholder "0.0"
  const payInput = page.locator('label:has-text("Pay")').locator('..').locator('input');
  await expect(payInput).toBeVisible({ timeout: 5_000 });
  await payInput.fill(collateral);

  // Wait for the form to compute position size
  await page.waitForTimeout(1000);

  // Click submit button ("Open Position" or "Increase Position")
  const submitButton = page.getByRole('button', { name: /open position|increase position/i });
  await expect(submitButton).toBeVisible({ timeout: 5_000 });
  await submitButton.click();

  // Wait for transaction submission toast
  const infoToast = page.locator('.Toastify__toast--info', {
    hasText: /transaction.*submitted|please wait/i,
  });
  await expect(infoToast).toBeVisible({ timeout: 10_000 });

  // Wait for success toast
  const successToast = page.locator('.Toastify__toast--success', {
    hasText: /submitted successfully|order.*success/i,
  });
  await expect(successToast).toBeVisible({ timeout: 60_000 });
  console.log(`  ✅ ${side} position opened with ${collateral} USDC`);
}

/**
 * Helper: Wait for a position to appear in the positions list.
 */
async function waitForPosition(page: import('@playwright/test').Page, timeoutMs = 30_000) {
  // Wait for "No open positions" to disappear
  const emptyState = page.locator('text=No open positions');
  await expect(emptyState).toBeHidden({ timeout: timeoutMs });
}

test.describe('Position Trading', () => {
  test.describe('Long Position Flow', () => {
    test('can open a long position', async ({ authenticatedWallet: page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      await submitOrder(page, 'long', '10');
      await waitForPosition(page);

      console.log('✅ Long position opened and visible');
    });

    test('can open a short position', async ({ authenticatedWallet: page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      await submitOrder(page, 'short', '10');
      await waitForPosition(page);

      console.log('✅ Short position opened and visible');
    });
  });

  test.describe('Position Management', () => {
    test('position data is displayed after opening', async ({ authenticatedWallet: page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      await submitOrder(page, 'long', '10');
      await waitForPosition(page);

      // The positions table/list should have some numerical content
      const positionsArea = page.locator('[class*="positionsContainer"], [class*="position"]').first();
      await expect(positionsArea).toBeVisible({ timeout: 10_000 });
      const content = await positionsArea.textContent();
      console.log(`  📊 Position content: ${content?.slice(0, 100)}...`);
      expect(content).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('shows error for insufficient collateral', async ({ authenticatedWallet: page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const sideTab = page.getByRole('tab', { name: /long/i });
      await expect(sideTab).toBeVisible({ timeout: 10_000 });
      await sideTab.click();

      // Enter a huge amount that exceeds balance
      const payInput = page.locator('label:has-text("Pay")').locator('..').locator('input');
      await expect(payInput).toBeVisible();
      await payInput.fill('999999999');
      await page.waitForTimeout(1000);

      const submitButton = page.getByRole('button', { name: /open position|increase position/i });

      // Either the button is visually disabled or clicking shows an error
      await submitButton.click();

      // Should see inline "Insufficient balance" validation error
      const insufficientError = page.locator('text=Insufficient balance');
      const errorToast = page.locator('.Toastify__toast--error');
      const validationToast = page.locator('.Toastify__toast--error', { hasText: /fill out|correctly/i });

      const hasError = await Promise.race([
        insufficientError.waitFor({ state: 'visible', timeout: 10_000 }).then(() => 'inline'),
        errorToast.waitFor({ state: 'visible', timeout: 10_000 }).then(() => 'toast'),
        validationToast.waitFor({ state: 'visible', timeout: 10_000 }).then(() => 'validation'),
      ]).catch(() => false);

      expect(hasError).toBeTruthy();
      console.log(`✅ Error shown for insufficient collateral (type: ${hasError})`);
    });
  });
});
