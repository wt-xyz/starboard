import { useEffect, useMemo } from 'react';

import { CosmosChainId, CosmosChainIdList } from '@/constants/graz';

import { getSelectedNetwork } from '@/state/appSelectors';
import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { getShouldShowNetworkSwitcher } from '@/state/appUiConfigsSelectors';
import { setSelectedNetwork } from '@/state/appUiConfigsSlice';

import { useNetworkSwitcher } from './useNetworkSwitcher';
import { useStringGetter } from './useStringGetter';

export const getNetworkParamFromUrl = () => {
  if (typeof window === 'undefined') return undefined;

  // Fallback for hash-based routing
  if (window.location.hash?.includes('?')) {
    return new URLSearchParams(window.location.hash.split('?')?.[1])?.get('network') ?? undefined;
  }

  return new URLSearchParams(window.location.search)?.get('network') ?? undefined;
};

export const useSelectedNetwork = (): {
  switchNetwork: (network: CosmosChainId) => Promise<void>;
  showNetworkSwitcher: boolean;
  selectedNetwork: CosmosChainId;
} => {
  const dispatch = useAppDispatch();
  const stringGetter = useStringGetter();
  const { switchNetwork } = useNetworkSwitcher();
  const selectedNetwork = useAppSelector(getSelectedNetwork);

  const networkParam = useMemo(() => getNetworkParamFromUrl(), []);

  useEffect(() => {
    if (!networkParam) return;

    const isValidNetwork = CosmosChainIdList.includes(networkParam as CosmosChainId);
    if (!isValidNetwork) {
      switchNetwork({
        network: selectedNetwork,
        confirmationModalMessage: stringGetter({
          key: 'unknownNetwork',
        }),
      });
      return;
    }

    if (selectedNetwork === networkParam) return;

    dispatch(setSelectedNetwork({ selectedNetwork: networkParam as CosmosChainId }));
  }, [dispatch, networkParam, selectedNetwork, stringGetter, switchNetwork]);

  const showNetworkSwitcher = useAppSelector(getShouldShowNetworkSwitcher);

  return {
    switchNetwork,
    showNetworkSwitcher,
    selectedNetwork,
  };
};
