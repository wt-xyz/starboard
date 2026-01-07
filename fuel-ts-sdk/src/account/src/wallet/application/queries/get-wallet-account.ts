import type { Account } from 'fuels';
import type { WalletConnectorRepository } from '@/account';

export const createGetWalletAccount =
  (repository: WalletConnectorRepository) => (): Promise<Account | undefined> =>
    repository.getWalletAccount();

