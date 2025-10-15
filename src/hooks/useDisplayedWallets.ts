import { useMemo } from 'react';

import { ConnectorType, WalletInfo, WalletType } from '@/constants/wallets';

import { isTruthy } from '@/lib/isTruthy';

import { useMipdInjectedWallets } from './useMipdInjectedWallets';

export const useDisplayedWallets = (): WalletInfo[] => {
  const injectedWallets = useMipdInjectedWallets();

  return useMemo(() => {
    return [
      {
        connectorType: ConnectorType.Fuel,
        name: WalletType.BakoSafe,
      },
      {
        connectorType: ConnectorType.Fuel,
        name: WalletType.Fuelet,
      },
      {
        connectorType: ConnectorType.Fuel,
        name: WalletType.FuelWallet,
      },
      // always show Metamask extension first if it is detected
      // Boolean(import.meta.env.VITE_PRIVY_APP_ID) && {
      //  connectorType: ConnectorType.Privy,
      //  name: WalletType.Privy,
      // },
    ].filter(isTruthy) as WalletInfo[];
  }, [injectedWallets]);
};
