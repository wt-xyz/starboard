import { test as base } from '@playwright/test';

/**
 * Base test fixture
 * Extend this for additional fixtures
 */
export const test = base;
export { expect } from '@playwright/test';
