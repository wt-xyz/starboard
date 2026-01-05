import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import { NetworkSwitchContextProvider } from './contexts/network-switch';
import { getIndexerUrl } from './lib/env';
import { FuelTsSdkProvider } from './lib/fuel-ts-sdk';
import { FuelWalletProvider } from './lib/fuel-wallet';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NetworkSwitchContextProvider>
      {(networkSwitch) => (
        <FuelTsSdkProvider
          indexerUrl={getIndexerUrl(networkSwitch.getCurrentNetwork())}
          key={networkSwitch.getCurrentNetwork()}
        >
          <FuelWalletProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </FuelWalletProvider>
        </FuelTsSdkProvider>
      )}
    </NetworkSwitchContextProvider>
  </StrictMode>
);
