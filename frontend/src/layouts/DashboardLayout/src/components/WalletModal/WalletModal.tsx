import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { WalletContext } from '@/contexts/WalletContext/WalletContext';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { CheckIcon, CopyIcon, ExitIcon } from '@radix-ui/react-icons';
import { $decimalValue } from 'fuel-ts-sdk';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import * as styles from './WalletModal.css';

type WalletModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  avatarGradient: string;
};

function truncateAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const WalletModal: FC<WalletModalProps> = ({
  open,
  onOpenChange,
  address,
  avatarGradient,
}) => {
  const wallet = useRequiredContext(WalletContext);
  const trading = useTradingSdk();
  const [copied, setCopied] = useState(false);

  const baseAsset = useSdkQuery(() => trading.getBaseAsset());
  const collateral = useSdkQuery((sdk) =>
    sdk.accounts.getCurrentUserAssetBalance(baseAsset?.assetId)
  );
  const collateralFetchStatus = useSdkQuery((sdk) => sdk.accounts.getCurrentUserDataFetchStatus());
  const isLoading = collateralFetchStatus === 'pending';

  const amount = $decimalValue(collateral).toFloat();
  const displayValue = formatCurrency(amount);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  }, [address]);

  const handleDisconnect = useCallback(() => {
    wallet.disconnect();
    onOpenChange(false);
  }, [wallet, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div css={styles.addressRow}>
            <span css={styles.avatar} style={{ background: avatarGradient }} />
            <span css={styles.addressText}>{truncateAddress(address)}</span>
            <button
              type="button"
              css={styles.copyButton}
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy address'}
            >
              {copied ? (
                <CheckIcon css={styles.copyIcon} />
              ) : (
                <CopyIcon css={styles.copyIcon} />
              )}
            </button>
          </div>

          <div css={styles.balanceSection}>
            <div css={styles.balanceRow}>
              <span css={styles.balanceLabel}>Available Collateral</span>
              <span css={styles.balanceValue}>
                {isLoading ? (
                  <span css={styles.skeleton} />
                ) : (
                  <>
                    {displayValue}
                    <span css={styles.balanceSymbol}>{baseAsset?.symbol}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div css={styles.divider} />

          <button type="button" css={styles.disconnectButton} onClick={handleDisconnect}>
            <ExitIcon />
            Disconnect
          </button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
