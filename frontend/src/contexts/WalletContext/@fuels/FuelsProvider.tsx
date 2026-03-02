import { type PropsWithChildren, memo } from 'react';
import {
  BurnerWalletConnector,
  FuelWalletConnector,
  FuelWalletDevelopmentConnector,
  FueletWalletConnector,
} from '@fuels/connectors';
import { FuelProvider, type NetworkConfig } from '@fuels/react';
import { envs } from '@/lib/env';
import type { Network } from '@/models/Network';

export const FuelsProvider = memo((props: PropsWithChildren) => {
  return (
    <FuelProvider
      fuelConfig={{
        connectors: fuelConnectors,
      }}
      networks={supportedNetworks}
      uiConfig={{
        suggestBridge: false,
      }}
      theme="dark"
    >
      {props.children}
    </FuelProvider>
  );
});

FuelsProvider.displayName = 'FuelsProvider';

const fuelConnectors = (() => {
  const defaultNetwork = envs.getDefaultNetwork();
  const chainId = envs.getChainIdByNetwork(defaultNetwork);

  const connectors = [new FuelWalletConnector(), new FueletWalletConnector()];

  if (envs.isDev()) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }

  if (defaultNetwork === 'testnet' || defaultNetwork === 'local') {
    connectors.push(new BurnerWalletConnector({ chainId }) as never);
  }

  return connectors;
})();

const supportedNetworks: NetworkConfig[] = Object.entries(envs.getAllRpcUrls()).flatMap(
  ([_network, url]) => {
    const network = _network as Network;

    if (!url) return [];

    return {
      chainId: envs.getChainIdByNetwork(network),
      url,
    };
  }
);
