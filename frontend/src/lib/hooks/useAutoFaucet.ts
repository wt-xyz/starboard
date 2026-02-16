import { useEffect, useRef } from 'react';
import { useCurrentConnector } from '@fuels/react';
import { toast } from 'react-toastify';
import { NetworkSwitchContext } from '@/contexts/NetworkSwitchContext/NetworkSwitchContext';
import { WalletContext } from '@/contexts/WalletContext/WalletContext';
import { requestTestnetEth } from '@/lib/ethFaucet';
import { useRequiredContext } from '@/lib/useRequiredContext';

const BURNER_WALLET_CONNECTOR_NAME = 'Burner Wallet';
const MIN_ETH_BALANCE_THRESHOLD = BigInt(100_000); // 0.0001 ETH (base units, 9 decimals)

/**
 * Auto-faucet hook for burner wallets.
 * Automatically requests testnet ETH when a burner wallet connects with 0 balance.
 */
export function useAutoFaucet(walletAddress: string | null) {
  const wallet = useRequiredContext(WalletContext);
  const networkSwitch = useRequiredContext(NetworkSwitchContext);
  const { currentConnector } = useCurrentConnector();
  const faucetRequestedRef = useRef(new Set<string>());
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Only run for burner wallets on testnet/local
    if (!walletAddress) {
      console.log('[Auto-faucet] No wallet address, skipping');
      return;
    }
    if (currentConnector?.name !== BURNER_WALLET_CONNECTOR_NAME) {
      console.log('[Auto-faucet] Not a burner wallet, skipping. Connector:', currentConnector?.name);
      return;
    }

    const currentNetwork = networkSwitch.getCurrentNetwork();
    console.log('[Auto-faucet] Current network:', currentNetwork);
    if (currentNetwork !== 'testnet' && currentNetwork !== 'local') {
      console.log('[Auto-faucet] Not on testnet/local, skipping');
      return;
    }

    // Prevent duplicate requests for the same address
    if (faucetRequestedRef.current.has(walletAddress)) {
      console.log('[Auto-faucet] Already requested for this address, skipping');
      return;
    }
    if (isCheckingRef.current) {
      console.log('[Auto-faucet] Already checking, skipping');
      return;
    }

    console.log('[Auto-faucet] Initiating auto-faucet check for address:', walletAddress);
    isCheckingRef.current = true;

    const checkBalanceAndFaucet = async () => {
      try {
        const account = await wallet.getCurrentAccount();
        if (!account?.provider) {
          console.log('[Auto-faucet] No account or provider available');
          return;
        }

        // Check ETH balance
        const baseAssetId = await account.provider.getBaseAssetId();
        const balance = await account.getBalance(baseAssetId);
        const balanceBigInt = typeof balance === 'bigint' ? balance : BigInt(balance.toString());

        console.log('[Auto-faucet] Current balance:', balanceBigInt.toString(), 'Threshold:', MIN_ETH_BALANCE_THRESHOLD.toString());

        // If balance is 0 or very low, request from faucet
        if (balanceBigInt < MIN_ETH_BALANCE_THRESHOLD) {
          console.log('[Auto-faucet] Balance below threshold, requesting ETH from faucet...');
          faucetRequestedRef.current.add(walletAddress);

          // Request 0.0001 ETH (100,000 base units with 9 decimals)
          const FAUCET_AMOUNT = 100_000; // 0.0001 ETH
          console.log('[Auto-faucet] Requesting', FAUCET_AMOUNT, 'base units (0.0001 ETH)');
          const result = await requestTestnetEth(account.provider, walletAddress, currentNetwork, FAUCET_AMOUNT);

          if (result.success) {
            console.log('[Auto-faucet] ✅ Success! ETH sent to wallet');
            toast.success('🚀 Testnet ETH sent to your burner wallet!', {
              autoClose: 3000,
            });
          } else {
            // Don't show error toast, just log it
            console.warn('[Auto-faucet] ❌ Failed:', result.error);
            // Remove from set so it can retry later if needed
            faucetRequestedRef.current.delete(walletAddress);
          }
        } else {
          console.log('[Auto-faucet] Balance sufficient, no faucet request needed');
        }
      } catch (error) {
        console.warn('[Auto-faucet] Exception during check:', error);
        // Remove from set so it can retry
        faucetRequestedRef.current.delete(walletAddress);
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Small delay to ensure wallet is fully initialized
    const timeoutId = setTimeout(checkBalanceAndFaucet, 1000);

    return () => {
      clearTimeout(timeoutId);
      isCheckingRef.current = false;
    };
  }, [walletAddress, currentConnector, wallet, networkSwitch]);

  // Clear the set when wallet disconnects
  useEffect(() => {
    if (!walletAddress) {
      faucetRequestedRef.current.clear();
    }
  }, [walletAddress]);
}
