import { ENVIRONMENT_CONFIG_MAP } from '@/constants/networks';

import { getSelectedNetwork } from '@/state/appSelectors';
import { useAppSelector } from '@/state/appTypes';

export interface EndpointsConfig {
  indexers: {
    api: string;
    socket: string;
  }[];
  validators: string[];
  rpcs: string[];
  skip: string;
  faucet?: string;
  stakingAPR?: string;
  affiliates?: string;
}

export const useEndpointsConfig = () => {
  const selectedNetwork = useAppSelector(getSelectedNetwork);
  const endpointsConfig: EndpointsConfig = ENVIRONMENT_CONFIG_MAP[selectedNetwork].endpoints;

  const rpcs = endpointsConfig?.rpcs ?? [];
  if (rpcs.length <= 0) {
    throw new Error(`No RPC endpoints configured for network ${selectedNetwork}`);
  }

  return {
    rpcs,
    defaultRpc: rpcs.at(0)!,
    indexer: endpointsConfig.indexers[0]!, // assume there's only one option for indexer endpoints
    validators: endpointsConfig.validators,
    skip: endpointsConfig.skip,
    faucet: endpointsConfig.faucet,
    stakingAPR: endpointsConfig.stakingAPR,
    affiliatesBaseUrl: endpointsConfig.affiliates,
  };
};
