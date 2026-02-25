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
    if (!walletAddress) return;
    if (currentConnector?.name !== BURNER_WALLET_CONNECTOR_NAME) return;

    const currentNetwork = networkSwitch.getCurrentNetwork();
    if (currentNetwork !== 'testnet' && currentNetwork !== 'local') return;

    // Prevent duplicate requests for the same address
    if (faucetRequestedRef.current.has(walletAddress)) return;
    if (isCheckingRef.current) return;

    isCheckingRef.current = true;

    const checkBalanceAndFaucet = async () => {
      try {
        const account = await wallet.getCurrentAccount();
        if (!account?.provider) return;

        // Check ETH balance
        const baseAssetId = await account.provider.getBaseAssetId();
        const balance = await account.getBalance(baseAssetId);
        const balanceBigInt = typeof balance === 'bigint' ? balance : BigInt(balance.toString());

        // If balance is 0 or very low, request from faucet
        if (balanceBigInt < MIN_ETH_BALANCE_THRESHOLD) {
          faucetRequestedRef.current.add(walletAddress);

          const FAUCET_AMOUNT = 100_000; // 0.0001 ETH (base units, 9 decimals)
          const result = await requestTestnetEth(account.provider, walletAddress, currentNetwork, FAUCET_AMOUNT);

          if (result.success) {
            toast.success('Testnet ETH sent to your burner wallet!', {
              autoClose: 3000,
            });
          } else {
            faucetRequestedRef.current.delete(walletAddress);
          }
        }
      } catch (_error) {
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
