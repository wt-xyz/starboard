import {
    BurnerWalletConnector,
    FuelWalletConnector,
    FuelWalletDevelopmentConnector,
    FueletWalletConnector,
} from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import { NetworkSwitchContextProvider } from './contexts/NetworkSwitchContext/index.ts';
import { WalletContextProvider } from './contexts/WalletContext/WalletContextProvider.tsx';
import { envs } from './lib/env';
import { FuelTsSdkProvider } from './lib/fuel-ts-sdk';
import './lib/pipe';
import './lib/toBigInt';
import './styles/radix-overrides.css';
import './styles/toastify.css';

const queryClient = new QueryClient();

/**
 * Get the networks supported by the app
 */
function getSupportedNetworks() {
  const rpcUrls = envs.getAllRpcUrls();
  const networks = [];

  // Add local network if configured
  if (rpcUrls.local) {
    networks.push({
      chainId: envs.getChainIdByNetwork('local'),
      url: rpcUrls.local,
    });
  }

  // Add testnet if configured
  if (rpcUrls.testnet) {
    networks.push({
      chainId: envs.getChainIdByNetwork('testnet'),
      url: rpcUrls.testnet,
    });
  }

  // Add mainnet if configured
  if (rpcUrls.mainnet) {
    networks.push({
      chainId: envs.getChainIdByNetwork('mainnet'),
      url: rpcUrls.mainnet,
    });
  }

  return networks;
}

/**
 * Creates the Fuel connectors for the FuelProvider
 */
function createFuelConnectors() {
  const defaultNetwork = envs.getDefaultNetwork();
  const chainId = envs.getChainIdByNetwork(defaultNetwork);

  const connectors = [
    new FuelWalletConnector(),
    new FueletWalletConnector(),
  ];

  // Development-only connectors
  if (import.meta.env.DEV) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }

  // Burner wallet available on testnet and local (not on mainnet)
  if (defaultNetwork === 'testnet' || defaultNetwork === 'local') {
    connectors.push(new BurnerWalletConnector({ chainId }) as any);
  }

  return connectors;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        fuelConfig={{
          connectors: createFuelConnectors(),
        }}
        networks={getSupportedNetworks()}
        uiConfig={{
          suggestBridge: false,
        }}
      >
        <WalletContextProvider>
          <NetworkSwitchContextProvider>
            {(networkSwitch) => (
              <FuelTsSdkProvider key={networkSwitch.getCurrentNetwork()}>
                <Theme appearance="dark">
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </Theme>
              </FuelTsSdkProvider>
            )}
          </NetworkSwitchContextProvider>
        </WalletContextProvider>
      </FuelProvider>
    </QueryClientProvider>
    <ToastContainer position="bottom-right" theme="dark" />
  </StrictMode>
);
