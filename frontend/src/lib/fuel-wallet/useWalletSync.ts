import { useAccount, useIsConnected } from '@fuels/react';
import { useEffect, useRef } from 'react';
import { useSdk } from '@/lib/fuel-ts-sdk';

/**
 * Syncs @fuels/react wallet state to the SDK Redux store.
 * This hook is the single bridge between React wallet state and the framework-agnostic SDK.
 */
export function useWalletSync(): void {
  const sdk = useSdk();
  const { account } = useAccount();
  const { isConnected } = useIsConnected();

  // Track previous values to avoid unnecessary dispatches
  const prevAccountRef = useRef<string | null>(null);
  const prevConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    const accountChanged = account !== prevAccountRef.current;
    const connectionChanged = isConnected !== prevConnectedRef.current;

    if (accountChanged || connectionChanged) {
      if (isConnected && account) {
        sdk.wallet.setConnected(account);
      } else if (!isConnected) {
        sdk.wallet.setDisconnected();
      }

      prevAccountRef.current = account ?? null;
      prevConnectedRef.current = isConnected;
    }
  }, [account, isConnected, sdk.wallet]);
}

