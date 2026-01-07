import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { useWalletState } from '@/lib/fuel-ts-sdk';
import { walletButton } from './Wallet.css';
import { WalletConnectorModal } from './WalletConnectorModal';

interface ConnectWalletButtonProps {
  className?: string;
}

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnecting } = useWalletState();

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
