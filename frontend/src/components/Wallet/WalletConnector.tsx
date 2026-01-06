import type { FC } from 'react';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';
import { selectIsWalletConnected } from 'fuel-ts-sdk/wallet';
import { ConnectWalletButton } from './ConnectWalletButton';
import { WalletStatus } from './WalletStatus';
import { walletContainer } from './Wallet.css';

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

