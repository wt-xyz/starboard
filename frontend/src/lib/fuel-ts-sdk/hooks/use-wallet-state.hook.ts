import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useSdk } from '@/lib/fuel-ts-sdk';

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
}

const defaultState: WalletState = {
  isConnected: false,
  isConnecting: false,
  address: null,
};

/**
 * Reactive hook for wallet connection state.
 * Uses useSyncExternalStore to subscribe to Redux store changes
 * and re-evaluates SDK queries on each change.
 */
export function useWalletState(): WalletState {
  const sdk = useSdk();
  const store = sdk.store;

  // Cache the previous snapshot to maintain referential equality
  const snapshotRef = useRef<WalletState>(defaultState);

  const getSnapshot = useCallback((): WalletState => {
    const isConnected = sdk.account.wallet.isConnected();
    const isConnecting = sdk.account.wallet.isConnecting();
    const address = sdk.account.wallet.getWalletAddress();

    const prev = snapshotRef.current;

    // Only create a new object if values changed
    if (
      prev.isConnected === isConnected &&
      prev.isConnecting === isConnecting &&
      prev.address === address
    ) {
      return prev;
    }

    const next: WalletState = { isConnected, isConnecting, address };
    snapshotRef.current = next;
    return next;
  }, [sdk.account.wallet]);

  const getServerSnapshot = useCallback((): WalletState => defaultState, []);

  return useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);
}
