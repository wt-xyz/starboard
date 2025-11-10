import { lazy, useCallback, useEffect, useState } from 'react';

import { BakoSafeConnector, FuelWalletConnector, FueletWalletConnector } from '@fuels/connectors';
import { Fuel, type FuelConnector } from 'fuels';

import { OnboardingState } from '@/constants/account';
import { ConnectorType, WalletNetworkType, WalletType } from '@/constants/wallets';

import { setOnboardingState } from '@/state/account';
import { useAppDispatch } from '@/state/appTypes';
import { clearSourceAccount, setSourceAddress, setWalletInfo } from '@/state/wallet';

export interface FuelWalletInfo {
  connectorType: ConnectorType.Fuel;
  name: WalletType.FuelWallet | WalletType.BakoSafe | WalletType.Fuelet;
  icon: `data:image/${string}`;
  rdns: string;
}

export const useFuelWallet = () => {
  const dispatch = useAppDispatch();
  const [fuel, setFuel] = useState<Fuel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Initialize Fuel instance with all three connectors
  useEffect(() => {
    const fuelInstance = new Fuel({
      connectors: [
        new FuelWalletConnector(),
        new FueletWalletConnector(),
        new BakoSafeConnector() as unknown as FuelConnector,
      ],
    });

    setFuel(fuelInstance);

    const handleConnectorChange = async (connection: FuelConnector) => {
      const accounts = await connection.accounts();
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const address = accounts[0];

      // Early exit if no address
      if (!address) return;

      setIsConnected(true);
      setAddress(address);

      dispatch(
        setSourceAddress({
          address,
          chain: WalletNetworkType.Evm,
        })
      );

      // Determine which wallet is connected based on connector name
      const connectorName = connection.name;
      let walletType: WalletType.FuelWallet | WalletType.BakoSafe | WalletType.Fuelet;
      let rdns: string;
      let icon: string;

      if (connectorName.includes('Bako')) {
        walletType = WalletType.BakoSafe;
        rdns = 'bako-safe';
        icon = 'bako.svg';
      } else if (connectorName.includes('Fuelet')) {
        walletType = WalletType.Fuelet;
        rdns = 'fuelet-wallet';
        icon = 'fuelet.svg';
      } else {
        walletType = WalletType.FuelWallet;
        rdns = 'fuel-wallet';
        icon = 'fuel-wallet.svg';
      }

      dispatch(
        setWalletInfo({
          connectorType: ConnectorType.Fuel,
          name: walletType,
          icon: `data:image/svg+xml;base64,${lazy(() => import(`../assets/wallets/${icon}?base64`))}`,
          rdns,
        } as FuelWalletInfo)
      );

      // For Fuel wallet, skip key derivation and go directly to AccountConnected
      dispatch(setOnboardingState(OnboardingState.AccountConnected));
    };

    fuelInstance.on(fuelInstance.events.currentConnector, handleConnectorChange);

    return () => {
      fuelInstance.off(fuelInstance.events.currentConnector, handleConnectorChange);
    };
  }, []);

  const connect = useCallback(
    async (walletType?: WalletType.FuelWallet | WalletType.BakoSafe | WalletType.Fuelet) => {
      if (!fuel) {
        setError('Fuel not initialized');
        return;
      }

      try {
        setIsConnecting(true);
        setError(undefined);

        // Get all available connectors
        const connectors = await fuel.connectors();
        
        // Map wallet type to connector name pattern
        let connectorNamePattern: string;
        if (walletType === WalletType.BakoSafe) {
          connectorNamePattern = 'Bako';
        } else if (walletType === WalletType.Fuelet) {
          connectorNamePattern = 'Fuelet';
        } else {
          // Default to Fuel Wallet
          connectorNamePattern = 'Fuel Wallet';
        }
        
        // Find the matching connector
        const targetConnector = connectors.find((connector) =>
          connector.name.includes(connectorNamePattern)
        );
        
        if (!targetConnector) {
          throw new Error(`Connector not found for ${walletType}. Please install the wallet extension.`);
        }
        
        // Select and connect using the connector's actual name
        await fuel.selectConnector(targetConnector.name);
        await fuel.connect();

        fuel.emit(fuel.events.currentConnector, fuel.currentConnector());
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to connect to ${walletType}`);
      } finally {
        setIsConnecting(false);
      }
    },
    [fuel, dispatch]
  );

  const disconnect = useCallback(async () => {
    if (!fuel) return;

    try {
      await fuel.disconnect();
      setIsConnected(false);
      setAddress(undefined);
      dispatch(clearSourceAccount());
      // Reset onboarding state when disconnecting
      dispatch(setOnboardingState(OnboardingState.Disconnected));
    } catch (err) {
      console.error('Error disconnecting from Fuel wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect from Fuel wallet');
    }
  }, [fuel, dispatch]);

  const getAccounts = useCallback(async () => {
    if (!isConnected) return [];

    try {
      const accounts = await fuel?.accounts();
      return accounts ?? [];
    } catch (err) {
      console.error('Error getting Fuel accounts:', err);
    }

    return [];
  }, [fuel, isConnected]);

  return {
    fuel,
    isConnected,
    address,
    isConnecting,
    error,
    connect,
    disconnect,
    getAccounts,
  };
};
