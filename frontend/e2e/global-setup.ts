/**
 * Global setup for Playwright tests
 * 
 * This runs once before all tests to verify the environment is ready.
 * Checks environment variables and verifies the app is running.
 */

export default async function globalSetup() {
  console.log('🔍 Running global setup for e2e tests...');

  try {
    // 1. Check environment variables
    const requiredEnvVars = [
      'VITE_DEFAULT_ENVIRONMENT',
      'VITE_RPC_URLS',
      'VITE_INDEXER_URLS',
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    console.log('✅ Environment variables verified');
    console.log(`  Default environment: ${process.env.VITE_DEFAULT_ENVIRONMENT}`);

    // 2. Check if the app is running
    const appUrl = 'http://localhost:5173';
    console.log(`\n🌐 Checking if app is running at ${appUrl}...`);

    try {
      const response = await fetch(appUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ App is running and accessible');
      } else {
        throw new Error(`App returned status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ App is not running or not accessible');
      console.error('\n💡 To fix this:');
      console.error('  1. Start the dev server in DEV MODE in another terminal:');
      console.error('     cd frontend && NODE_ENV=development VITE_ENV=dev pnpm dev');
      console.error('     (or simply: cd frontend && pnpm dev)');
      console.error('\n  2. Wait for it to start (usually shows "Local: http://localhost:5173")');
      console.error('\n  3. Verify dev mode is enabled (burner wallet option should be visible)');
      console.error('\n  4. Then run the tests again\n');
      console.error('\n⚠️  IMPORTANT: The app MUST run in development mode for e2e tests.');
      console.error('   This enables network switcher, local network, and burner wallet.\n');
      throw new Error(`Cannot connect to app at ${appUrl}. Make sure the dev server is running.`);
    }

    console.log('✅ Global setup complete\n');
  } catch (error) {
    console.error('\n❌ Global setup failed:');
    console.error(error instanceof Error ? error.message : String(error));
    throw error;
  }
}
