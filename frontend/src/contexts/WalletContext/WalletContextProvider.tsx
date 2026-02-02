import { useConnectUI, useDisconnect, useFuel, useIsConnected, useNetwork } from '@fuels/react';
import type { FC, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { WalletContext, type WalletContextType } from './WalletContext';

type WalletContextProviderProps = {
  children: ReactNode;
};

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const { fuel } = useFuel();
  const { connect } = useConnectUI();
  const { disconnect: fuelDisconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { network } = useNetwork();

  const isUserConnected = useCallback(() => isConnected ?? false, [isConnected]);

  const establishConnection = useCallback(async () => {
    // useConnectUI's connect() shows the connector selection dialog
    connect();
  }, [connect]);

  const disconnect = useCallback(async () => {
    fuelDisconnect();
  }, [fuelDisconnect]);

  const getCurrentNetwork = useCallback(async () => {
    if (network) return network;
    return await fuel.currentNetwork();
  }, [fuel, network]);

  const changeNetwork = useCallback(
    async (newNetwork: Parameters<WalletContextType['changeNetwork']>[0]) => {
      await fuel.selectNetwork(newNetwork);
    },
    [fuel]
  );

  const getCurrentAccount = useCallback(async () => {
    const address = await fuel.currentAccount();
    if (!address) return null;
    const account = await fuel.getWallet(address);
    if (!account) return null;
    return account;
  }, [fuel]);

  const registerNetworkChangeObserver = useCallback(
    (listener: Parameters<WalletContextType['registerNetworkChangeObserver']>[0]) => {
      fuel.on(fuel.events.currentNetwork, listener);
    },
    [fuel]
  );

  const unregisterNetworkChangeObserver = useCallback(
    (listener: Parameters<WalletContextType['unregisterNetworkChangeObserver']>[0]) => {
      fuel.off(fuel.events.currentNetwork, listener);
    },
    [fuel]
  );

  const contextValue = useMemo<WalletContextType>(
    () => ({
      changeNetwork,
      disconnect,
      establishConnection,
      getCurrentAccount,
      getCurrentNetwork,
      isUserConnected,
      registerNetworkChangeObserver,
      unregisterNetworkChangeObserver,
    }),
    [
      changeNetwork,
      disconnect,
      establishConnection,
      getCurrentAccount,
      getCurrentNetwork,
      isUserConnected,
      registerNetworkChangeObserver,
      unregisterNetworkChangeObserver,
    ]
  );

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
};
