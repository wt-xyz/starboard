import styled from 'styled-components';

import { type MenuItem } from '@/constants/menus';
import {
  AVAILABLE_ENVIRONMENTS,
  ENVIRONMENT_CONFIG_MAP,
  type DydxNetwork,
} from '@/constants/networks';
import { ColorToken } from '@/constants/styles/base';

export const useNetworks = (): MenuItem<DydxNetwork>[] => {
  const availableNetworks = AVAILABLE_ENVIRONMENTS.environments as DydxNetwork[];
  const allNetworks = Object.keys(ENVIRONMENT_CONFIG_MAP) as DydxNetwork[];
  const upcomingNetworks = allNetworks.filter((network) => !availableNetworks.includes(network));

  const availableItems = availableNetworks.map((dydxNetwork) => {
    const config = ENVIRONMENT_CONFIG_MAP[dydxNetwork];
    const isMainnet = config.isMainnet;

    return {
      key: dydxNetwork,
      label: config.name,
      value: dydxNetwork,
      slotBefore: (
        <$NetworkIndicator
          $color={isMainnet ? ColorToken.Green4 : ColorToken.Orange0}
          aria-hidden="true"
        />
      ),
    };
  });

  const upcomingItems = upcomingNetworks.map((network) => {
    const config = ENVIRONMENT_CONFIG_MAP[network];
    const isMainnet = config.isMainnet;

    return {
      key: `${network}-coming-soon`,
      label: `${config.name} (Coming Soon)`,
      value: network,
      slotBefore: (
        <$NetworkIndicator
          $color={isMainnet ? ColorToken.Green4 : ColorToken.Orange0}
          aria-hidden="true"
        />
      ),
      disabled: true,
    } as MenuItem<DydxNetwork>;
  });

  return [...availableItems, ...upcomingItems];
};

const $NetworkIndicator = styled.span<{ $color: string }>`
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`;
