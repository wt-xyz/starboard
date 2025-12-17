import { lazy, useCallback, useEffect, useState } from 'react';

import {
  findConnectorByWalletTypePattern,
  getConnectorMeta,
  type FuelConnectorMeta,
} from '@/@starboard/constants/fuelWallets';
import { BakoSafeConnector, FuelWalletConnector, FueletWalletConnector } from '@fuels/connectors';
import { Fuel, type FuelConnector } from 'fuels';

import { OnboardingState } from '@/constants/account';
import { ConnectorType, WalletNetworkType, WalletType } from '@/constants/wallets';

import { setOnboardingState } from '@/state/account';
import { useAppDispatch } from '@/state/appTypes';
import { clearSourceAccount, setSourceAddress, setWalletInfo } from '@/state/wallet';

export type FuelWalletInfo = FuelConnectorMeta & {
  connectorType: ConnectorType.Fuel;
};

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
      const { walletType, rdns, icon } = getConnectorMeta(connection.name);

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
  }, [dispatch]);

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

        // Find the matching connector
        const targetConnector = findConnectorByWalletTypePattern(connectors, walletType);

        if (!targetConnector) {
          throw new Error(
            `Connector not found for ${walletType}. Please install the wallet extension.`
          );
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
    [fuel]
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
      // Error disconnecting from Fuel wallet
      setError(err instanceof Error ? err.message : 'Failed to disconnect from Fuel wallet');
    }
  }, [fuel, dispatch]);

  const getAccounts = useCallback(async () => {
    if (!isConnected) return [];

    try {
      const accounts = await fuel?.accounts();
      return accounts ?? [];
    } catch (err) {
      // console.error('Error getting Fuel accounts:', err);
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
