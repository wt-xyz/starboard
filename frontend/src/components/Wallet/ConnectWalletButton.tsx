import { useConnectUI } from '@fuels/react';
import type { FC } from 'react';
import { walletButton } from './Wallet.css';

interface ConnectWalletButtonProps {
  className?: string;
}

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({ className }) => {
  const { connect, isConnecting } = useConnectUI();

  return (
    <button
      type="button"
      className={`${walletButton} ${className ?? ''}`}
      onClick={() => connect()}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

