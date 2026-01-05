import { useDisconnect } from '@fuels/react';
import type { FC } from 'react';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';
import { selectWalletAddress } from 'fuel-ts-sdk/wallet';
import {
  walletStatusContainer,
  walletAddress as walletAddressStyle,
  disconnectButton,
} from './Wallet.css';

interface WalletStatusProps {
  className?: string;
}

/**
 * Truncates a wallet address for display
 * e.g., "0x1234...5678"
 */
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const WalletStatus: FC<WalletStatusProps> = ({ className }) => {
  const address = useSdkQuery(selectWalletAddress);
  const { disconnect, isPending } = useDisconnect();

  if (!address) return null;

  return (
    <div className={`${walletStatusContainer} ${className ?? ''}`}>
      <span className={walletAddressStyle}>{truncateAddress(address)}</span>
      <button
        className={disconnectButton}
        onClick={() => disconnect()}
        disabled={isPending}
        type="button"
      >
        {isPending ? '...' : 'Disconnect'}
      </button>
    </div>
  );
};

