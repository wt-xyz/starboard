import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import { NetworkSwitchContextProvider } from './contexts/NetworkSwitchContext/index.ts';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { WalletContextProvider } from './contexts/WalletContext/WalletContextProvider.tsx';
import { FuelTsSdkProvider } from './lib/fuel-ts-sdk';
import './lib/pipe';
import './lib/toBigInt';
import './styles/global.css';
import './styles/radix-overrides.css';
import './styles/reduced-motion.css';
import './styles/scrollbar.css';
import './styles/toastify.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        {({ theme }) => (
          <WalletContextProvider>
            <NetworkSwitchContextProvider>
              {(networkSwitch) => (
                <FuelTsSdkProvider key={networkSwitch.getCurrentNetwork()}>
                  <Theme appearance={theme}>
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </Theme>
                </FuelTsSdkProvider>
              )}
            </NetworkSwitchContextProvider>
          </WalletContextProvider>
        )}
      </ThemeContextProvider>
    </QueryClientProvider>
    <ToastContainer position="bottom-right" theme="dark" />
  </StrictMode>
);
