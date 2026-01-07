import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { safeAddress } from 'fuel-ts-sdk';
import { walletAdapters } from 'fuel-ts-sdk/wallet';
import type { Network as FuelsNetwork } from 'fuels';
import { WalletContext, type WalletContextType } from './wallet.context';

type WalletContextProviderProps = {
  children: ReactNode;
};

/**
 * WalletContextProvider - Thin wrapper around SDK wallet repository
 *
 * Uses the same wallet repository factory that the SDK uses,
 * ensuring a single Fuel instance with consistent wallet list.
 */
export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Create repository once - uses the same Fuel instance as SDK
  const repositoryRef = useRef(walletAdapters.createFuelWalletConnectorRepository());

  // Subscribe to connection changes
  useEffect(() => {
    const unsubscribe = repositoryRef.current.onConnectionChange((connected) => {
      setIsConnected(connected);
    });
    return unsubscribe;
  }, []);

  const isUserConnected = useCallback(() => isConnected, [isConnected]);

  const establishConnection = useCallback(async () => {
    // Get available connectors and connect to the first installed one
    const connectors = await repositoryRef.current.getAvailableConnectors();
    const installed = connectors.find((c) => c.installed);
    if (installed) {
      await repositoryRef.current.connect(installed.id);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await repositoryRef.current.disconnect();
  }, []);

  const getUserAddress = useCallback(async () => {
    const account = await repositoryRef.current.getWalletAccount();
    if (!account) return undefined;
    return safeAddress(account.address.toB256().toLowerCase());
  }, []);

  const getUserBalances = useCallback(async () => {
    return await repositoryRef.current.getUserBalances();
  }, []);

  const getUserWalletReference = useCallback(async () => {
    return await repositoryRef.current.getWalletAccount();
  }, []);

  const getCurrentNetwork = useCallback(async () => {
    return await repositoryRef.current.getCurrentNetwork();
  }, []);

  const changeNetwork = useCallback(async (network: FuelsNetwork) => {
    await repositoryRef.current.changeNetwork(network);
  }, []);

  const registerNetworkChangeObserver = useCallback(
    (listener: (network: FuelsNetwork) => void) => {
      repositoryRef.current.onNetworkChange(listener);
    },
    []
  );

  const unregisterNetworkChangeObserver = useCallback(
    (_listener: (network: FuelsNetwork) => void) => {
      // Note: The repository returns unsubscribe function from onNetworkChange,
      // but this interface doesn't support it. For now, this is a no-op.
      // Consider refactoring the interface to return unsubscribe functions.
    },
    []
  );

  const contextValue = useMemo<WalletContextType>(
    () => ({
      getUserWalletReference,
      isUserConnected,
      disconnect,
      establishConnection,
      getUserAddress,
      getUserBalances,
      getCurrentNetwork,
      changeNetwork,
      registerNetworkChangeObserver,
      unregisterNetworkChangeObserver,
    }),
    [
      getUserWalletReference,
      isUserConnected,
      disconnect,
      establishConnection,
      getUserAddress,
      getUserBalances,
      getCurrentNetwork,
      changeNetwork,
      registerNetworkChangeObserver,
      unregisterNetworkChangeObserver,
    ]
  );

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
};
