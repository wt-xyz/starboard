import { NetworkSwitchContext } from '@/contexts/NetworkSwitchContext';
import { envs } from '@/lib/env';
import { useRequiredContext } from '@/lib/useRequiredContext';
import type { Network } from '@/models/Network';
import { NETWORKS } from '@/models/Network';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Select } from 'radix-ui';
import type { FC } from 'react';
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

  const handleNetworkChange = async (network: Network) => {
    if (network !== currentNetwork && !isChanging) {
      setIsChanging(true);
      try {
        await networkSwitch.changeNetwork(network);
      } catch (error) {
        // Error is already handled in the context provider
        // Select will revert to current value automatically since we don't update state on error
      } finally {
        setIsChanging(false);
      }
    }
  };

  return (
    <div css={$.networkSwitcherContainer}>
      <span css={$.networkLabel}>Network</span>
      <Select.Root
        value={currentNetwork}
        onValueChange={handleNetworkChange}
        disabled={isChanging}
      >
        <Select.Trigger className={$.selectTrigger()}>
          <Select.Value>{NETWORK_LABELS[currentNetwork]}</Select.Value>
          <Select.Icon className={$.triggerIcon}>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={$.selectContent} position="popper">
            <Select.Viewport>
              {availableNetworks.map((network) => (
                <Select.Item
                  key={network}
                  value={network}
                  className={$.selectItem()}
                >
                  <Select.ItemText>{NETWORK_LABELS[network]}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};
