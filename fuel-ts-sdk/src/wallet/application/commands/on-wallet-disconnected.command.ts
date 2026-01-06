import type { StoreService } from '@/shared/lib/store-service';
import { setWalletDisconnected } from '../../infrastructure';

export const createOnWalletDisconnectedCommand =
  (store: StoreService) => (): void => {
    store.dispatch(setWalletDisconnected());
  };

