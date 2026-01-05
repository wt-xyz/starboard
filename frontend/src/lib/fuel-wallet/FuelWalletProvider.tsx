import { FuelProvider } from '@fuels/react';
import { FuelWalletConnector, FueletWalletConnector } from '@fuels/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC, ReactNode } from 'react';
import { useMemo, useContext, useState } from 'react';
import { NetworkSwitchContext } from '@/contexts/network-switch';
import { useWalletSync } from './useWalletSync';

// Fuel network configurations
const FUEL_NETWORKS = {
  local: 'http://127.0.0.1:4000/v1/graphql',
  testnet: 'https://testnet.fuel.network/v1/graphql',
} as const;

interface FuelWalletProviderProps {
  children: ReactNode;
}

const WalletSyncWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  useWalletSync();
  return <>{children}</>;
};

export const FuelWalletProvider: FC<FuelWalletProviderProps> = ({ children }) => {
  const networkContext = useContext(NetworkSwitchContext);
  const currentNetwork = networkContext?.getCurrentNetwork() ?? 'testnet';

  const [queryClient] = useState(() => new QueryClient());

  const fuelConfig = useMemo(
    () => ({
      connectors: [new FuelWalletConnector(), new FueletWalletConnector()],
    }),
    []
  );

  const networkUrl = FUEL_NETWORKS[currentNetwork];

  return (
    <QueryClientProvider client={queryClient}>
      <FuelProvider fuelConfig={fuelConfig} networks={[{ url: networkUrl, chainId: 0 }]}>
        <WalletSyncWrapper>{children}</WalletSyncWrapper>
      </FuelProvider>
    </QueryClientProvider>
  );
};

