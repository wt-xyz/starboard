import type { StoreService } from '@/shared/lib/store-service';
import { selectIsWalletConnecting } from '../../infrastructure';

export const createGetIsConnecting = (storeService: StoreService) => (): boolean =>
  selectIsWalletConnecting(storeService.getState());

