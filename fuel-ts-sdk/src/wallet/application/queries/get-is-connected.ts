import type { StoreService } from '@/shared/lib/store-service';
import { selectIsWalletConnected } from '../../infrastructure';

export const createGetIsConnected =
  (storeService: StoreService) => (): boolean =>
    selectIsWalletConnected(storeService.getState());

