import type { RootState } from '@/shared/lib/redux';

export const selectWalletAddress = (state: RootState): string | null => state.wallet.address;

export const selectIsWalletConnected = (state: RootState): boolean => state.wallet.isConnected;

