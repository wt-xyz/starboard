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

  // Confirm a position action button is actually present
  const actionButton = page.getByRole('button', { name: /decrease|close|increase/i }).first();
  await expect(actionButton).toBeVisible({ timeout: timeoutMs });
}

/**
 * Helper: Open the Decrease Position dialog by clicking the minus icon button
 * in the position row. The button has a tooltip "Decrease or close position".
 */
async function openDecreaseDialog(page: import('@playwright/test').Page) {
  // The minus icon button is inside an ActionsCell <td> in the positions table.
  // Radix Tooltip doesn't set aria-label, so locate structurally: the only
  // button inside a <td> in the positions tabpanel.
  const positionsPanel = page.getByRole('tabpanel', { name: 'Positions' });
  const decreaseBtn = positionsPanel.locator('td button').first();
  await expect(decreaseBtn).toBeVisible({ timeout: 10_000 });
  await decreaseBtn.click();

  // Wait for the Radix dialog to appear with the title "Decrease Position"
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5_000 });
  await expect(dialog.getByRole('heading', { name: 'Manage Position' })).toBeVisible();
  return dialog;
}

/**
 * Helper: Close a position at 100% via the Decrease Position dialog.
 */
async function closePosition(page: import('@playwright/test').Page) {
  const dialog = await openDecreaseDialog(page);

  // Click the 100% percentage mark button
  await dialog.locator('button:has-text("100%")').click();

  // The submit button should now read "Close Position"
  const closeBtn = dialog.locator('button:has-text("Close Position")');
  await expect(closeBtn).toBeVisible({ timeout: 5_000 });
  await closeBtn.click();

  // Dialog closes before toasts appear
  await expect(dialog).toBeHidden({ timeout: 5_000 });

  // Wait for info toast (transaction submitted)
  const infoToast = page.locator('.Toastify__toast--info', {
    hasText: /transaction.*submitted|please wait/i,
  });
  await expect(infoToast).toBeVisible({ timeout: 10_000 });

  // Wait for success toast (position closed)
  const successToast = page.locator('.Toastify__toast--success', {
    hasText: /position closed successfully/i,
  });
  await expect(successToast).toBeVisible({ timeout: 60_000 });
  console.log('  Position closed successfully');
}

/**
 * Helper: Decrease a position by a given percentage via the Decrease Position dialog.
 */
async function decreasePosition(
  page: import('@playwright/test').Page,
  percentage: '25%' | '50%' | '75%'
) {
  const dialog = await openDecreaseDialog(page);

  // Click the percentage mark button
  await dialog.locator(`button:has-text("${percentage}")`).click();

  // The submit button should read "Decrease Position" (not at 100%)
  const decreaseBtn = dialog.locator('button:has-text("Decrease Position")');
  await expect(decreaseBtn).toBeVisible({ timeout: 5_000 });
  await decreaseBtn.click();

  // Dialog closes before toasts appear
  await expect(dialog).toBeHidden({ timeout: 5_000 });

  // Wait for info toast
  const infoToast = page.locator('.Toastify__toast--info', {
    hasText: /transaction.*submitted|please wait/i,
  });
  await expect(infoToast).toBeVisible({ timeout: 10_000 });

  // Wait for success toast
  const successToast = page.locator('.Toastify__toast--success', {
    hasText: /position decreased successfully/i,
  });
  await expect(successToast).toBeVisible({ timeout: 60_000 });
  console.log(`  Position decreased by ${percentage}`);
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
      const positionsArea = page
        .locator('[class*="positionsContainer"], [class*="position"]')
        .first();
      await expect(positionsArea).toBeVisible({ timeout: 10_000 });
      const content = await positionsArea.textContent();
      console.log(`  📊 Position content: ${content?.slice(0, 100)}...`);
      expect(content).toBeTruthy();
    });
  });

  test.describe('Close Position', () => {
    test('can close a long position fully', async ({ authenticatedWallet: page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Open a long position first
      await submitOrder(page, 'long', '10');
      await waitForPosition(page);

      // Close the position at 100%
      await closePosition(page);

      // Verify the position is gone
      const emptyState = page.locator('text=No open positions');
      await expect(emptyState).toBeVisible({ timeout: 30_000 });
      console.log('Long position fully closed and removed from list');
    });

    test('can partially decrease a position', async ({ authenticatedWallet: page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Open a long position first
      await submitOrder(page, 'long', '10');
      await waitForPosition(page);

      // Decrease the position by 50%
      await decreasePosition(page, '50%');

      // Position should still exist (not fully closed)
      const emptyState = page.locator('text=No open positions');
      await expect(emptyState).toBeHidden({ timeout: 10_000 });
      console.log('Position decreased by 50% and still visible');
    });
  });

  test.describe('Increase Position', () => {
    test('increase button shows when position exists', async ({ authenticatedWallet: page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Open a long position first
      await submitOrder(page, 'long', '10');
      await waitForPosition(page);

      // Verify the submit button now says "Increase Position" (for the same side)
      const sideTab = page.getByRole('tab', { name: /long/i });
      await sideTab.click();

      const increaseButton = page.getByRole('button', { name: /increase position/i });
      await expect(increaseButton).toBeVisible({ timeout: 10_000 });
      console.log('Submit button shows "Increase Position" when position exists');
    });

    test('can increase an existing position', async ({ authenticatedWallet: page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      // Open a long position first
      await submitOrder(page, 'long', '10');
      await waitForPosition(page);

      // Submit another long order — submitOrder already handles "Increase Position" button text
      await submitOrder(page, 'long', '10');

      // Position should still exist
      const emptyState = page.locator('text=No open positions');
      await expect(emptyState).toBeHidden({ timeout: 10_000 });
      console.log('Position increased successfully');
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
      const validationToast = page.locator('.Toastify__toast--error', {
        hasText: /fill out|correctly/i,
      });

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
