import type { StoreService } from '@/shared/lib/store-service';
import { setWalletConnected } from '../../infrastructure';

export const createOnWalletConnectedCommand =
  (store: StoreService) =>
  (address: string): void => {
    if (!address) {
      throw new Error('Wallet address is required');
    }
    store.dispatch(setWalletConnected({ address }));
  };

