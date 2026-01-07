import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { selectWalletAddress } from 'fuel-ts-sdk/wallet';
import { useSdk, useSdkQuery } from '@/lib/fuel-ts-sdk';
import {
  disconnectButton,
  walletAddress as walletAddressStyle,
  walletStatusContainer,
} from './Wallet.css';

interface WalletStatusProps {
  className?: string;
}

export const WalletStatus: FC<WalletStatusProps> = ({ className }) => {
  const sdk = useSdk();
  const address = useSdkQuery(selectWalletAddress);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      await sdk.account.wallet.disconnect();
    } finally {
      setIsDisconnecting(false);
    }
  }, [sdk.account.wallet]);

  if (!address) return null;

  return (
    <div className={`${walletStatusContainer} ${className ?? ''}`}>
      <span className={walletAddressStyle}>{truncateAddress(address)}</span>
      <button
        className={disconnectButton}
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        type="button"
      >
        {isDisconnecting ? '...' : 'Disconnect'}
      </button>
    </div>
  );
};

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
