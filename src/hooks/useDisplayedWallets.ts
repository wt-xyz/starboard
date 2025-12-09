import { useMemo } from 'react';

import { ConnectorType, WalletInfo, WalletType } from '@/constants/wallets';

import { isTruthy } from '@/lib/isTruthy';

export const useDisplayedWallets = (): WalletInfo[] => {
  return useMemo(() => {
    return [
      {
        connectorType: ConnectorType.Fuel,
        name: WalletType.FuelWallet,
        icon: '/icons/wallets/fuel-wallet.svg',
      },
      {
        connectorType: ConnectorType.Fuel,
        name: WalletType.BakoSafe,
        icon: '/icons/wallets/bako-safe.svg',
      },
      {
        connectorType: ConnectorType.Fuel,
        name: WalletType.Fuelet,
        icon: '/icons/wallets/fuelet.svg',
      },
    ].filter(isTruthy) as WalletInfo[];
  }, []);
};
