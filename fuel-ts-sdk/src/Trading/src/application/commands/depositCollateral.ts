import type { VaultCommands } from '@sdk/shared/contracts';
import type { CollateralAmount } from '@sdk/shared/models/decimals';
import type { PositionStableId } from '@sdk/shared/types';
import type { MarketQueries } from '../../Markets';
import { PositionSide, type PositionsQueries } from '../../Positions';

export interface DepositCollateralDependencies {
  vaultCommands: VaultCommands;
  positionsQueries: PositionsQueries;
  marketQueries: MarketQueries;
}

export interface DepositCollateralParams {
  positionId: PositionStableId;
  amount: CollateralAmount;
}

export const createDepositCollateralCommand =
  (deps: DepositCollateralDependencies) => async (params: DepositCollateralParams) => {
    const { positionId, amount } = params;

    const position = deps.positionsQueries.getPositionById(positionId);
    if (!position) {
      throw new Error(`Position not found: ${positionId}`);
    }

    const baseAsset = deps.marketQueries.getBaseAsset();
    if (!baseAsset) {
      throw new Error('Base asset not found');
    }

    await deps.vaultCommands.increasePosition({
      indexAsset: position.assetId,
      collateralAssetId: baseAsset.assetId,
      sizeDelta: '0',
      collateralAmount: amount.value.toString(),
      isLong: position.side === PositionSide.LONG,
    });
  };
