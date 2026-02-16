import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this config file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables based on the project
// Default to local if no specific env file is specified
const envFile = process.env.PLAYWRIGHT_ENV_FILE || '.env.e2e.local';
const envPath = resolve(__dirname, envFile);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`❌ Failed to load environment file: ${envPath}`);
  console.error(result.error);
} else {
  console.log(`📝 Loaded environment from: ${envPath}`);
  console.log(`🌍 VITE_DEFAULT_ENVIRONMENT: ${process.env.VITE_DEFAULT_ENVIRONMENT}`);
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false, // Run tests serially for wallet state consistency
  timeout: 90_000, // 90 seconds for blockchain operations + confirmation delays
  expect: { timeout: 15_000 }, // 15s for assertions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  projects: [
    {
      name: 'local-testnet',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        storageState: undefined, // Fresh wallet each run
      },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'remote-testnet',
      use: {
        ...devices['Desktop Chrome'],
        // Run app locally but configured to use testnet network
        // (testnet RPC, indexer URLs come from .env.e2e.testnet)
        baseURL: 'http://localhost:5173',
        storageState: undefined,
      },
      testMatch: /.*\.spec\.ts/,
    },
  ],

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true, // Always reuse if server is running
    timeout: 120_000,
    env: {
      // Pass through environment variables to the dev server
      ...process.env,
      // Force dev mode to enable network switcher and local network
      NODE_ENV: 'development',
      VITE_ENV: 'dev',
    },
  },

  // Global setup to verify predicate has funds
  globalSetup: './e2e/global-setup.ts',
});
