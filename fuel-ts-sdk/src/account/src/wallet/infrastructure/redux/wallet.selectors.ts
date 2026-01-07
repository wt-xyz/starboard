import type { RootState } from '@/shared/lib/redux';

export const selectWalletAddress = (state: RootState): string | null => state.wallet.address;

export const selectIsWalletConnected = (state: RootState): boolean => state.wallet.isConnected;

export const selectIsWalletConnecting = (state: RootState): boolean => state.wallet.isConnecting;

export const selectWalletConnectorId = (state: RootState): string | null =>
  state.wallet.connectorId;

export const selectWalletError = (state: RootState): string | null => state.wallet.error;

