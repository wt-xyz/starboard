import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { NetworkSwitchContext } from '@/contexts/NetworkSwitchContext/NetworkSwitchContext';
import { WalletContext } from '@/contexts/WalletContext/WalletContext';
import { envs } from '@/lib/env';
import {
    getFaucetConfig,
    getPredicateAddress,
    requestTestnetEth,
    saveFaucetConfig,
} from '@/lib/ethFaucet';
import { formatCurrency, formatNumber } from '@/lib/formatCurrency';
import { useSdk, useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { useCurrentConnector } from '@fuels/react';
import { CheckIcon, ChevronDownIcon, CopyIcon, ExitIcon } from '@radix-ui/react-icons';
import { $decimalValue } from 'fuel-ts-sdk';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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

const BURNER_WALLET_CONNECTOR_NAME = 'Burner Wallet';

export const WalletModal: FC<WalletModalProps> = ({
  open,
  onOpenChange,
  address,
  avatarGradient,
}) => {
  const wallet = useRequiredContext(WalletContext);
  const trading = useTradingSdk();
  const sdk = useSdk();
  const { currentConnector } = useCurrentConnector();
  const networkSwitch = useRequiredContext(NetworkSwitchContext);
  const currentNetwork = networkSwitch.getCurrentNetwork();
  const [copied, setCopied] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isRequestingEth, setIsRequestingEth] = useState(false);
  const [predicateAddress, setPredicateAddress] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('0.5');
  const [isFunding, setIsFunding] = useState(false);
  const [ethBalance, setEthBalance] = useState<bigint | null>(null);
  const [ethBalanceLoading, setEthBalanceLoading] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const isBurnerWallet = currentConnector?.name === BURNER_WALLET_CONNECTOR_NAME;
  const showBurnerUI = isBurnerWallet && envs.isDev();
  const showTestnetTools = currentNetwork === 'testnet' || currentNetwork === 'local';
  const showGetTestnetEth = showTestnetTools;

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

  const handleMint = useCallback(async () => {
    setIsMinting(true);
    try {
      await sdk.__extra.faucet();
    } finally {
      setIsMinting(false);
    }
  }, [sdk]);

  const handleGetTestnetEth = useCallback(async () => {
    setIsRequestingEth(true);
    try {
      const account = await wallet.getCurrentAccount();
      if (!account?.provider) {
        toast.error('Could not get wallet provider');
        return;
      }
      const result = await requestTestnetEth(account.provider, address, currentNetwork);
      if (result.success) {
        toast.success('Testnet ETH sent. It may take a moment to appear.');
      } else {
        toast.error(result.error || 'Failed to get testnet ETH');
      }
    } finally {
      setIsRequestingEth(false);
    }
  }, [wallet, address, currentNetwork]);

  // Compute predicate address from env/artifact PIN (for Fund faucet applet)
  useEffect(() => {
    if (!showGetTestnetEth || !open) return;
    let cancelled = false;
    const config = getFaucetConfig(currentNetwork);
    wallet.getCurrentAccount().then((account) => {
      if (cancelled || !account?.provider) return;
      try {
        const addr = getPredicateAddress(account.provider, config.pin, config.maxFaucetAmount);
        if (!cancelled) setPredicateAddress(addr);
      } catch {
        // ignore
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, showGetTestnetEth, currentNetwork, wallet]);

  // Fetch wallet ETH (base asset) balance when modal opens
  const ETH_DECIMALS = 9;
  useEffect(() => {
    if (!open || !address) {
      setEthBalance(null);
      return;
    }
    let cancelled = false;
    setEthBalanceLoading(true);
    wallet
      .getCurrentAccount()
      .then(async (account) => {
        if (cancelled || !account?.provider) return;
        try {
          const baseAssetId = await account.provider.getBaseAssetId();
          const balance = await account.getBalance(baseAssetId);
          if (cancelled) return;
          setEthBalance(typeof balance === 'bigint' ? balance : BigInt(balance.toString()));
        } catch {
          if (!cancelled) setEthBalance(null);
        } finally {
          if (!cancelled) setEthBalanceLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEthBalance(null);
          setEthBalanceLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, address, wallet]);

  const handleFundFaucet = useCallback(async () => {
    const account = await wallet.getCurrentAccount();
    if (!account?.provider || !predicateAddress) {
      toast.error('Wallet or predicate address not ready');
      return;
    }
    const amountEth = parseFloat(fundAmount);
    if (!Number.isFinite(amountEth) || amountEth <= 0) {
      toast.error('Enter a valid amount (ETH)');
      return;
    }
    const amountBase = BigInt(Math.round(amountEth * 1e9));
    if (amountBase <= 0n) {
      toast.error('Amount too small');
      return;
    }
    setIsFunding(true);
    try {
      const baseAssetId = await account.provider.getBaseAssetId();
      const tx = await account.transfer(
        predicateAddress,
        Number(amountBase),
        baseAssetId,
        { gasLimit: 15_000 }
      );
      await tx.waitForResult();
      const config = getFaucetConfig(currentNetwork);
      saveFaucetConfig(currentNetwork, { pin: config.pin, maxFaucetAmount: config.maxFaucetAmount });
      toast.success('Faucet funded. "Get testnet ETH" will use this faucet.');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Failed to fund faucet');
    } finally {
      setIsFunding(false);
    }
  }, [wallet, predicateAddress, fundAmount, currentNetwork]);

  const handleCopyPredicateAddress = useCallback(async () => {
    if (!predicateAddress) return;
    try {
      await navigator.clipboard.writeText(predicateAddress);
      toast.success('Predicate address copied');
    } catch {
      toast.error('Failed to copy');
    }
  }, [predicateAddress]);

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

          {showBurnerUI && (
            <div css={styles.burnerSection}>
              <p css={styles.burnerNotice}>
                You're using a Burner Wallet. It's stored in this browser only. Use the button
                below to fund it with test USDC.
              </p>
              <button
                type="button"
                css={styles.burnerMintButton}
                onClick={handleMint}
                disabled={isMinting}
              >
                {isMinting ? 'Minting...' : 'Mint USDC'}
              </button>
            </div>
          )}

          {showTestnetTools && !showBurnerUI && (
            <div css={styles.getTestnetEthSection}>
              <button
                type="button"
                css={styles.getTestnetEthButton}
                onClick={handleMint}
                disabled={isMinting}
              >
                {isMinting ? 'Minting...' : 'Mint test USDC'}
              </button>
            </div>
          )}

          {showGetTestnetEth && (
            <div css={styles.getTestnetEthSection}>
              <button
                type="button"
                css={styles.getTestnetEthButton}
                onClick={handleGetTestnetEth}
                disabled={isRequestingEth}
              >
                {isRequestingEth ? 'Requesting...' : 'Get testnet ETH'}
              </button>
            </div>
          )}

          {showGetTestnetEth && (
            <div css={styles.advancedPanel}>
              <button
                type="button"
                css={styles.advancedTrigger}
                onClick={() => setAdvancedOpen((o) => !o)}
                aria-expanded={advancedOpen}
              >
                <span>Advanced</span>
                <ChevronDownIcon
                  css={styles.advancedChevron}
                  style={{ transform: advancedOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                />
              </button>
              {advancedOpen && (
                <div css={styles.fundFaucetSection}>
                  <div css={styles.fundFaucetTitle}>Fund testnet faucet</div>
                  <p css={styles.burnerNotice}>
                    Deploy and fund the eth-faucet predicate with your web wallet. After funding,
                    &quot;Get testnet ETH&quot; will use this faucet for this network.
                  </p>
                  {predicateAddress && (
                    <div css={styles.fundFaucetAddressRow}>
                      <span css={styles.fundFaucetAddressText}>
                        {truncateAddress(predicateAddress)}
                      </span>
                      <button
                        type="button"
                        css={styles.copyButton}
                        onClick={handleCopyPredicateAddress}
                        aria-label="Copy predicate address"
                      >
                        <CopyIcon css={styles.copyIcon} />
                      </button>
                    </div>
                  )}
                  <input
                    type="number"
                    css={styles.fundFaucetAmountInput}
                    placeholder="Amount (ETH)"
                    min="0"
                    step="0.1"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                  />
                  <button
                    type="button"
                    css={styles.fundFaucetButton}
                    onClick={handleFundFaucet}
                    disabled={isFunding || !predicateAddress}
                  >
                    {isFunding ? 'Funding...' : 'Fund faucet'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div css={styles.balanceSection}>
            <div css={styles.balanceRow}>
              <span css={styles.balanceLabel}>ETH</span>
              <span css={styles.balanceValue}>
                {ethBalanceLoading ? (
                  <span css={styles.skeleton} />
                ) : ethBalance !== null ? (
                  <>
                    {formatNumber(Number(ethBalance) / 10 ** ETH_DECIMALS, { decimals: 4 })}
                    <span css={styles.balanceSymbol}>ETH</span>
                  </>
                ) : (
                  <span css={styles.balanceSymbol}>—</span>
                )}
              </span>
            </div>
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
