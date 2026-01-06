import type { FC } from 'react';
import { useState, useCallback } from 'react';
import { useSdkQuery } from '@/lib/fuel-ts-sdk';
import { selectIsWalletConnecting } from 'fuel-ts-sdk/wallet';
import { WalletConnectorModal } from './WalletConnectorModal';
import { walletButton } from './Wallet.css';

interface ConnectWalletButtonProps {
  className?: string;
}

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isConnecting = useSdkQuery(selectIsWalletConnecting);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <button
        type="button"
        className={`${walletButton} ${className ?? ''}`}
        onClick={openModal}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      <WalletConnectorModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

