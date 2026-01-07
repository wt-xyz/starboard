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
  const repository = repositoryRef.current;

  // Subscribe to connection changes
  useEffect(() => {
    const unsubscribe = repository.onConnectionChange((connected) => {
      setIsConnected(connected);
    });
    return unsubscribe;
  }, [repository]);

  const isUserConnected = useCallback(() => isConnected, [isConnected]);

  const establishConnection = useCallback(async () => {
    // Get available connectors and connect to the first installed one
    const connectors = await repository.getAvailableConnectors();
    const installed = connectors.find((c) => c.installed);
    if (installed) {
      await repository.connect(installed.id);
    }
  }, [repository]);

  const disconnect = useCallback(async () => {
    await repository.disconnect();
  }, [repository]);

  const getUserAddress = useCallback(async () => {
    const account = await repository.getWalletAccount();
    if (!account) return undefined;
    return safeAddress(account.address.toB256().toLowerCase());
  }, [repository]);

  const getUserBalances = useCallback(async () => {
    return await repository.getUserBalances();
  }, [repository]);

  const getUserWalletReference = useCallback(async () => {
    return await repository.getWalletAccount();
  }, [repository]);

  const getCurrentNetwork = useCallback(async () => {
    return await repository.getCurrentNetwork();
  }, [repository]);

  const changeNetwork = useCallback(
    async (network: FuelsNetwork) => {
      await repository.changeNetwork(network);
    },
    [repository]
  );

  const registerNetworkChangeObserver = useCallback(
    (listener: (network: FuelsNetwork) => void) => {
      repository.onNetworkChange(listener);
    },
    [repository]
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
