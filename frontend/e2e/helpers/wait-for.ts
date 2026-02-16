import { Page, expect } from '@playwright/test';
import { CommonSelectors } from '../selectors';

/**
 * Wait for a toast notification with specific message and type
 */
export async function waitForToast(
  page: Page,
  message: string | RegExp,
  type: 'success' | 'error' | 'info' | 'warning' = 'success',
  timeout = 30_000
): Promise<void> {
  const toastSelector = CommonSelectors.toast[type];
  const toast = page.locator(toastSelector, { hasText: message });
  await expect(toast).toBeVisible({ timeout });
}

/**
 * Wait for transaction to complete by watching for toast notifications
 */
export async function waitForTransaction(page: Page): Promise<void> {
  // Wait for the transaction submission toast
  await waitForToast(page, /transaction.*submit|submitting/i, 'info', 5_000);

  // Wait for either success or error
  const successToast = page.locator(CommonSelectors.toast.success);
  const errorToast = page.locator(CommonSelectors.toast.error);

  await Promise.race([
    expect(successToast).toBeVisible({ timeout: 30_000 }),
    expect(errorToast).toBeVisible({ timeout: 30_000 }),
  ]);
}

/**
 * Wait for position table to update by checking for loading state to disappear
 */
export async function waitForPositionUpdate(page: Page): Promise<void> {
  // Wait a bit for the update to trigger
  await page.waitForTimeout(500);

  // Wait for any skeleton loaders to disappear
  const skeleton = page.locator('[class*="skeleton"]').first();
  if (await skeleton.isVisible()) {
    await expect(skeleton).toBeHidden({ timeout: 10_000 });
  }

  // Additional wait for data to stabilize
  await page.waitForTimeout(1000);
}

/**
 * Wait for page to be ready (no loading indicators)
 */
export async function waitForPageReady(page: Page): Promise<void> {
  // Wait for common loading indicators to disappear
  const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');
  const count = await loadingIndicators.count();

  if (count > 0) {
    await expect(loadingIndicators.first()).toBeHidden({ timeout: 15_000 });
  }

  // Wait for DOM to be ready (don't use 'networkidle' - the app has continuous polling)
  await page.waitForLoadState('domcontentloaded', { timeout: 10_000 });
}

/**
 * Wait for an element to be visible and stable (not animating)
 */
export async function waitForStableElement(
  page: Page,
  selector: string,
  timeout = 10_000
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout });
  await element.waitFor({ state: 'visible', timeout });

  // Wait a bit for any animations to complete
  await page.waitForTimeout(300);
}

/**
 * Retry an action with exponential backoff
 */
export async function retryWithBackoff<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`  ⚠️  Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
