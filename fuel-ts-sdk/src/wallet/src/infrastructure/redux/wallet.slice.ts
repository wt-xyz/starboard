import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WalletState } from './wallet.types';

const initialState: WalletState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  connectorId: null,
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setConnected: (
      state,
      action: PayloadAction<{ address: string; connectorId: string }>
    ) => {
      state.address = action.payload.address;
      state.connectorId = action.payload.connectorId;
      state.isConnected = true;
      state.isConnecting = false;
      state.error = null;
    },
    setDisconnected: (state) => {
      state.address = null;
      state.connectorId = null;
      state.isConnected = false;
      state.isConnecting = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
  },
});

export const { setConnecting, setConnected, setDisconnected, setError } =
  walletSlice.actions;
export const walletReducer = walletSlice.reducer;

