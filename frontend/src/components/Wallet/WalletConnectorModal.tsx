import type { FC } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSdk, useSdkQuery } from '@/lib/fuel-ts-sdk';
import { selectIsWalletConnecting, selectWalletError } from 'fuel-ts-sdk/wallet';
import type { ConnectorInfo } from 'fuel-ts-sdk/wallet';
import {
  modalOverlay,
  modalContent,
  modalHeader,
  modalTitle,
  modalSubtitle,
  modalClose,
  connectorList,
  connectorItem,
  connectorIconWrapper,
  connectorIcon,
  connectorInfo,
  connectorName,
  connectorStatus,
  connectorArrow,
  loadingContainer,
  loadingSkeleton,
  modalError,
  modalFooter,
  modalFooterText,
  modalFooterLink,
} from './Wallet.css';

interface WalletConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectorModal: FC<WalletConnectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const sdk = useSdk();
  const isConnecting = useSdkQuery(selectIsWalletConnecting);
  const error = useSdkQuery(selectWalletError);
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setConnectingId(null);
      sdk.wallet.getAvailableConnectors().then((list) => {
        setConnectors(list);
        setLoading(false);
      });
    }
  }, [isOpen, sdk.wallet]);

  const handleConnect = useCallback(
    async (connectorId: string) => {
      setConnectingId(connectorId);
      try {
        await sdk.wallet.establishConnection(connectorId);
        onClose();
      } catch {
        setConnectingId(null);
      }
    },
    [sdk.wallet, onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isConnecting) {
        onClose();
      }
    },
    [onClose, isConnecting]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isConnecting) {
        onClose();
      }
    },
    [onClose, isConnecting]
  );

  if (!isOpen) return null;

  return (
    <div 
      className={modalOverlay} 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div className={modalContent}>
        <div className={modalHeader}>
          <div>
            <h2 id="wallet-modal-title" className={modalTitle}>
              Connect Wallet
            </h2>
            <p className={modalSubtitle}>
              Choose your preferred wallet
            </p>
          </div>
          <button
            className={modalClose}
            onClick={onClose}
            disabled={isConnecting}
            type="button"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className={loadingContainer}>
            <div className={loadingSkeleton} />
            <div className={loadingSkeleton} />
          </div>
        ) : (
          <div className={connectorList}>
            {connectors.map((connector) => {
              const isThisConnecting = connectingId === connector.id;
              const isDisabled = isConnecting || !connector.installed;
              
              return (
                <button
                  key={connector.id}
                  className={connectorItem}
                  onClick={() => handleConnect(connector.id)}
                  disabled={isDisabled}
                  type="button"
                >
                  <div className={connectorIconWrapper}>
                    {connector.icon ? (
                      <img
                        src={connector.icon}
                        alt=""
                        className={connectorIcon}
                      />
                    ) : (
                      <span style={{ fontSize: '20px' }}>🔗</span>
                    )}
                  </div>
                  <div className={connectorInfo}>
                    <div className={connectorName}>{connector.name}</div>
                    <div className={connectorStatus}>
                      {!connector.installed
                        ? 'Not installed'
                        : isThisConnecting
                          ? 'Connecting...'
                          : 'Available'}
                    </div>
                  </div>
                  <span className={connectorArrow}>→</span>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <div className={modalError}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className={modalFooter}>
          <p className={modalFooterText}>
            New to Fuel?{' '}
            <a
              href="https://wallet.fuel.network/"
              target="_blank"
              rel="noopener noreferrer"
              className={modalFooterLink}
            >
              Get a wallet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

