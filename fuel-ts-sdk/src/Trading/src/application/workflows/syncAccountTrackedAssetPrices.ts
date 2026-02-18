import type { WalletQueries } from '@sdk/Accounts';
import type { AssetId } from '@sdk/shared/types';
import type { MarketCommands, MarketQueries } from '../../Markets';
import { type PositionsQueries, filterPositionsByAccountAddress } from '../../Positions';

export interface SyncAccountTrackedAssetPricesWorkflowDependencies {
  walletQueries: WalletQueries;
  marketQueries: MarketQueries;
  marketCommands: MarketCommands;
  positionsQueries: PositionsQueries;
}

export const createSyncAccountTrackedAssetPricesWorkflow = (
  deps: SyncAccountTrackedAssetPricesWorkflowDependencies
) => {
  let synced = new Set<AssetId>();

  return () => {
    const needed = new Set<AssetId>();

    const currentUserAddress = deps.walletQueries.getCurrentUserAddress();
    const baseAsset = deps.marketQueries.getBaseAsset();
    const watchedAsset = deps.marketQueries.getWatchedAsset();

    if (baseAsset) needed.add(baseAsset.assetId);
    if (watchedAsset) needed.add(watchedAsset.assetId);

    if (currentUserAddress) {
      const userOpenPositions = filterPositionsByAccountAddress(
        deps.positionsQueries.getAllLatestPositions(),
        currentUserAddress
      ).filter((p) => deps.positionsQueries.isPositionOpen(p.stableId));

      userOpenPositions.forEach((p) => needed.add(p.assetId));
    }

    for (const id of synced) {
      if (!needed.has(id)) deps.marketCommands.desyncAssetPrice(id);
    }

    for (const id of needed) {
      if (!synced.has(id)) deps.marketCommands.syncAssetPrice(id);
    }

    synced = needed;
  };
};
