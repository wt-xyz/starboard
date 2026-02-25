import type { WalletQueries } from '@sdk/Accounts';
import { monomemo } from '@sdk/shared/lib/memo';
import { type PositionsQueries, filterPositionsByAccountAddress } from '../../Positions';

export interface GetCurrentAccountPositionRevisionsQueryDeps {
  positionsQueries: PositionsQueries;
  walletQueries: WalletQueries;
}

export const createGetCurrentAccountPositionRevisionsQuery = (
  deps: GetCurrentAccountPositionRevisionsQueryDeps
) => {
  const currentUserAddressGetter = deps.walletQueries.getCurrentUserAddress;
  const allPositionRevisionsGetter = deps.positionsQueries.getAllPositionRevisions;

  const getCurrentAccountPositionRevisions = monomemo(
    (
      currentUserAddress: ReturnType<typeof currentUserAddressGetter>,
      allPositionRevisions: ReturnType<typeof allPositionRevisionsGetter>
    ) => {
      if (!currentUserAddress) return [];
      return filterPositionsByAccountAddress(allPositionRevisions, currentUserAddress);
    }
  );

  return () =>
    getCurrentAccountPositionRevisions(currentUserAddressGetter(), allPositionRevisionsGetter());
};
