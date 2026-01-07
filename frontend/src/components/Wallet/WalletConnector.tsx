import type { FC } from 'react';
import { selectIsWalletConnected } from 'fuel-ts-sdk/wallet';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';
import { ConnectWalletButton } from './ConnectWalletButton';
import { walletContainer } from './Wallet.css';
import { WalletStatus } from './WalletStatus';

interface WalletConnectorProps {
  className?: string;
}

export const WalletConnector: FC<WalletConnectorProps> = ({ className }) => {
  const isConnected = useSdkQuery(selectIsWalletConnected);

  return (
    <div className={`${walletContainer} ${className ?? ''}`}>
      {isConnected ? <WalletStatus /> : <ConnectWalletButton />}
    </div>
  );
};
