import { useAccount, useIsConnected } from '@fuels/react';
import { useEffect, useRef } from 'react';
import { useSdk } from '@/lib/fuel-ts-sdk';

export function useWalletSync(): void {
  const sdk = useSdk();
  const { account } = useAccount();
  const { isConnected } = useIsConnected();

  const prevAccountRef = useRef<string | null>(null);
  const prevConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    const accountChanged = account !== prevAccountRef.current;
    const connectionChanged = isConnected !== prevConnectedRef.current;

    if (accountChanged || connectionChanged) {
      if (isConnected && account) {
        sdk.wallet.onWalletConnected(account);
      } else if (!isConnected) {
        sdk.wallet.onWalletDisconnected();
      }

      prevAccountRef.current = account ?? null;
      prevConnectedRef.current = isConnected;
    }
  }, [account, isConnected, sdk.wallet]);
}

