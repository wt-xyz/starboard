export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectorId: string | null;
  error: string | null;
}
