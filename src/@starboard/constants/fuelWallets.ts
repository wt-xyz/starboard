import { WalletType } from '@/constants/wallets';

export type FuelConnectorMeta = {
  walletType: WalletType.FuelWallet | WalletType.BakoSafe | WalletType.Fuelet;
  rdns: string;
  icon: string;
};

const CONNECTOR_META_BY_PATTERN: Record<string, FuelConnectorMeta> = {
  Bako: { walletType: WalletType.BakoSafe, rdns: 'bako-safe', icon: 'bako.svg' },
  Fuelet: { walletType: WalletType.Fuelet, rdns: 'fuelet-wallet', icon: 'fuelet.svg' },
  'Fuel Wallet': {
    walletType: WalletType.FuelWallet,
    rdns: 'fuel-wallet',
    icon: 'fuel-wallet.svg',
  },
};

export const getConnectorMeta = (connectorName: string): FuelConnectorMeta => {
  const entry = Object.entries(CONNECTOR_META_BY_PATTERN).find(([pattern]) =>
    connectorName.includes(pattern)
  );
  return entry ? entry[1] : CONNECTOR_META_BY_PATTERN['Fuel Wallet'];
};

export const findConnectorByWalletTypePattern = (
  connectors: Array<{ name: string }>,
  walletType?: WalletType.FuelWallet | WalletType.BakoSafe | WalletType.Fuelet
) => {
  const pattern =
    walletType === WalletType.BakoSafe
      ? 'Bako'
      : walletType === WalletType.Fuelet
        ? 'Fuelet'
        : 'Fuel Wallet';
  return connectors.find((connector) => connector.name.includes(pattern));
};
