import type { StoreService } from '@/shared/lib/store-service';
import { selectWalletAddress } from '../../infrastructure';

export const createGetWalletAddress = (storeService: StoreService) => (): string | null =>
  selectWalletAddress(storeService.getState());
