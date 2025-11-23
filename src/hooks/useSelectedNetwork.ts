import { useCallback, useEffect } from 'react';

import { useWallets } from '@privy-io/react-auth';

import { LocalStorageKey } from '@/constants/localStorage';
import {
  AVAILABLE_ENVIRONMENTS,
  DEFAULT_APP_ENVIRONMENT,
  DydxNetwork,
  ENVIRONMENT_CONFIG_MAP,
} from '@/constants/networks';

import { useMainnetSwitchWarning } from '@/hooks/useMainnetSwitchWarning';

import { setSelectedNetwork } from '@/state/app';
import { getSelectedNetwork } from '@/state/appSelectors';
import { useAppDispatch, useAppSelector } from '@/state/appTypes';

import { validateAgainstAvailableEnvironments } from '@/lib/network';

import { useLocalStorage } from './useLocalStorage';

const getNetworkParamFromUrl = (): DydxNetwork | undefined => {
  if (typeof window === 'undefined') return undefined;

  const useHash = import.meta.env.VITE_ROUTER_TYPE === 'hash';
  let search = '';

  if (useHash) {
    const hash = window.location.hash;
    const idx = hash.indexOf('?');
    if (idx !== -1) {
      search = hash.substring(idx + 1);
    }
  } else {
    search = window.location.search.startsWith('?')
      ? window.location.search.slice(1)
      : window.location.search;
  }

  if (!search) return undefined;

  const params = new URLSearchParams(search);
  const desiredNetwork = params.get('network');
  if (!desiredNetwork) return undefined;

  const normalized = desiredNetwork.toLowerCase();
  return (AVAILABLE_ENVIRONMENTS.environments as DydxNetwork[]).find(
    (network) => network.toLowerCase() === normalized
  );
};

export const useSelectedNetwork = (): {
  switchNetwork: (network: DydxNetwork) => void;
  selectedNetwork: DydxNetwork;
} => {
  const dispatch = useAppDispatch();
  const selectedNetwork = useAppSelector(getSelectedNetwork);
  const { wallets } = useWallets();
  const privyWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

  const [, setLocalStorageNetwork] = useLocalStorage<DydxNetwork>({
    key: LocalStorageKey.SelectedNetwork,
    defaultValue: DEFAULT_APP_ENVIRONMENT,
    validateFn: validateAgainstAvailableEnvironments,
  });

  const { maybeWarnBeforeSwitch } = useMainnetSwitchWarning();

  const switchNetwork = useCallback(
    (network: DydxNetwork) => {
      if (!(AVAILABLE_ENVIRONMENTS.environments as DydxNetwork[]).includes(network)) {
        return;
      }

      const targetConfig = ENVIRONMENT_CONFIG_MAP[network];
      const targetChainId = Number(targetConfig.ethereumChainId);

      maybeWarnBeforeSwitch(targetConfig.isMainnet, () => {
        setLocalStorageNetwork(network);
        dispatch(setSelectedNetwork(network));
        privyWallet?.switchChain(targetChainId);
      });
    },
    [dispatch, setLocalStorageNetwork, privyWallet, maybeWarnBeforeSwitch]
  );

  // Ensure the selected network is valid
  useEffect(() => {
    if (!AVAILABLE_ENVIRONMENTS.environments.includes(selectedNetwork)) {
      switchNetwork(DEFAULT_APP_ENVIRONMENT);
    }
  }, [selectedNetwork, switchNetwork]);

  useEffect(() => {
    const queryNetwork = getNetworkParamFromUrl();
    if (!queryNetwork || queryNetwork === selectedNetwork) {
      return;
    }

    setLocalStorageNetwork(queryNetwork);
    dispatch(setSelectedNetwork(queryNetwork));
  }, [dispatch, selectedNetwork, setLocalStorageNetwork]);

  return { switchNetwork, selectedNetwork };
};
