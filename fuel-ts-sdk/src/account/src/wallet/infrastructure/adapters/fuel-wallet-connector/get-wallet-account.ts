import type { Account, Fuel } from 'fuels';

export const getWalletAccount = (fuel: Fuel) => async (): Promise<Account | undefined> => {
  try {
    const currentAccount = await fuel.currentAccount();
    if (!currentAccount) {
      return undefined;
    }

    return await fuel.getWallet(currentAccount);
  } catch {
    // Return undefined if not connected
    return undefined;
  }
};
