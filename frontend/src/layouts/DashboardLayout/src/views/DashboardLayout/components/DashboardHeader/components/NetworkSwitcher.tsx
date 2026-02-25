import type { FC } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Select } from 'radix-ui';
import { useBoolean } from 'usehooks-ts';
import { NetworkSwitchContext } from '@/contexts/NetworkSwitchContext';
import { envs } from '@/lib/env';
import { useRequiredContext } from '@/lib/useRequiredContext';
import type { Network } from '@/models/Network';
import { NETWORKS } from '@/models/Network';
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
  return NETWORKS.filter((network) => network !== 'local');
}

export const NetworkSwitcher: FC = () => {
  const networkSwitch = useRequiredContext(NetworkSwitchContext);
  const currentNetwork = networkSwitch.getCurrentNetwork();
  const isChangingBool = useBoolean();
  const availableNetworks = getAvailableNetworks();

  const handleNetworkChange = async (network: Network) => {
    if (network !== currentNetwork && !isChangingBool.value) {
      isChangingBool.setTrue();
      await networkSwitch.changeNetwork(network).finally(isChangingBool.setFalse);
    }
  };

  return (
    <div css={$.networkSwitcherContainer}>
      <span css={$.networkLabel}>Network</span>
      <Select.Root
        value={currentNetwork}
        onValueChange={handleNetworkChange}
        disabled={isChangingBool.value}
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
                <Select.Item key={network} value={network} className={$.selectItem()}>
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
