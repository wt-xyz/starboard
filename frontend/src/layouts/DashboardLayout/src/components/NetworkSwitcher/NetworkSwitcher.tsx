import { NetworkSwitchContext } from '@/contexts/NetworkSwitchContext/NetworkSwitchContext';
import { envs } from '@/lib/env';
import { useRequiredContext } from '@/lib/useRequiredContext';
import type { Network } from '@/models/Network';
import { NETWORKS } from '@/models/Network';
import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';
import * as $ from './NetworkSwitcher.css';

const NETWORK_LABELS: Record<Network, string> = {
  local: 'Local',
  testnet: 'Testnet',
  mainnet: 'Mainnet',
};

// Filter networks based on environment
function getAvailableNetworks(): Network[] {
  // In development, all networks are available
  if (envs.isDev()) {
    return [...NETWORKS];
  }
  
  // In production, only testnet and mainnet are available (local requires localhost)
  return NETWORKS.filter(network => network !== 'local');
}

export const NetworkSwitcher: FC = () => {
  const networkSwitch = useRequiredContext(NetworkSwitchContext);
  const currentNetwork = networkSwitch.getCurrentNetwork();
  const [isChanging, setIsChanging] = useState(false);
  const availableNetworks = getAvailableNetworks();

  const handleNetworkChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const network = event.target.value as Network;
    if (network !== currentNetwork && !isChanging) {
      setIsChanging(true);
      try {
        await networkSwitch.changeNetwork(network);
      } catch (error) {
        // Error is already handled in the context provider
        // Reset the select to the current network
        event.target.value = currentNetwork;
      } finally {
        setIsChanging(false);
      }
    }
  };

  return (
    <div css={$.container}>
      <span css={$.label}>Network</span>
      <select
        css={$.select}
        value={currentNetwork}
        onChange={handleNetworkChange}
        disabled={isChanging}
      >
        {availableNetworks.map((network) => (
          <option key={network} value={network}>
            {NETWORK_LABELS[network]}
          </option>
        ))}
      </select>
    </div>
  );
};
