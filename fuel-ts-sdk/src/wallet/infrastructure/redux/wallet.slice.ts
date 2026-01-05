import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WalletState } from './wallet.types';

const initialState: WalletState = {
  address: null,
  isConnected: false,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletConnected: (state, action: PayloadAction<{ address: string }>) => {
      state.address = action.payload.address;
      state.isConnected = true;
    },
    setWalletDisconnected: (state) => {
      state.address = null;
      state.isConnected = false;
    },
  },
});

export const { setWalletConnected, setWalletDisconnected } = walletSlice.actions;
export const walletReducer = walletSlice.reducer;

