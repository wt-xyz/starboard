import {
    BurnerWalletConnector,
    FuelWalletConnector,
    FuelWalletDevelopmentConnector,
    FueletWalletConnector,
    WalletConnectConnector,
} from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC, ReactNode } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import { privyConfig, wagmiConfig } from './config';
import { NetworkSwitchContextProvider } from './contexts/NetworkSwitchContext/index.ts';
import { WalletContextProvider } from './contexts/WalletContext/WalletContextProvider.tsx';
import { envs } from './lib/env';
import { FuelTsSdkProvider } from './lib/fuel-ts-sdk';
import './lib/pipe';
import './lib/toBigInt';
import './styles/radix-overrides.css';
import './styles/toastify.css';

const queryClient = new QueryClient();

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const isPrivyEnabled = PRIVY_APP_ID && PRIVY_APP_ID.length > 0;
const isWalletConnectEnabled = Boolean(
  isPrivyEnabled && WALLETCONNECT_PROJECT_ID && WALLETCONNECT_PROJECT_ID.length > 0
);

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

  // Development connectors
  if (import.meta.env.DEV) {
    connectors.push(
      new FuelWalletDevelopmentConnector(),
      new BurnerWalletConnector({ chainId }) as any
    );
  }

  // EVM wallet support via WalletConnect
  if (isWalletConnectEnabled) {
    connectors.push(
      new WalletConnectConnector({
        projectId: WALLETCONNECT_PROJECT_ID,
        wagmiConfig: wagmiConfig as any,
        chainId,
      }) as any
    );
  }

  return connectors;
}

/**
 * Conditionally wraps children with Privy/Wagmi providers when a valid Privy app ID is configured.
 */
const EvmWalletProviders: FC<{ children: ReactNode }> = ({ children }) => {
  if (!isPrivyEnabled) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <EvmWalletProviders>
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
      </EvmWalletProviders>
    </QueryClientProvider>
    <ToastContainer position="bottom-right" theme="dark" />
  </StrictMode>
);
