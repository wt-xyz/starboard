import type { Fuel } from 'fuels';
import { assetId, type AssetId } from '@/shared/types';

export const getUserBalances =
  (fuel: Fuel) => async (): Promise<Record<AssetId, bigint>> => {
    try {
      const currentAccount = await fuel.currentAccount();
      if (!currentAccount) {
        return {};
      }

      const wallet = await fuel.getWallet(currentAccount);
      const { balances } = await wallet.getBalances();

      return balances.reduce(
        (acc, balance) => ({
          ...acc,
          [assetId(balance.assetId)]: BigInt(balance.amount.toString()),
        }),
        {} as Record<AssetId, bigint>
      );
    } catch {
      // Return empty balances if not connected
      return {};
    }
  };
