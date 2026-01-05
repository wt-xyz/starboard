export interface WalletState {
  address: string | null;
  isConnected: boolean;
  // Future STAR-119 fields:
  // accounts: string[];
  // selectedAccountIndex: number;
  // connectionTimestamp: number | null;
}

