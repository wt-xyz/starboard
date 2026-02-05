import type { VaultCommands } from '@sdk/shared/contracts';
import type { CollateralAmount } from '@sdk/shared/models/decimals';
import type { PositionStableId } from '@sdk/shared/types';
import { PositionSide, type PositionsQueries } from '../../Positions';

export interface WithdrawCollateralDependencies {
  vaultCommands: VaultCommands;
  positionsQueries: PositionsQueries;
}

export interface WithdrawCollateralParams {
  positionId: PositionStableId;
  amount: CollateralAmount;
}

export const createWithdrawCollateralCommand =
  (deps: WithdrawCollateralDependencies) => async (params: WithdrawCollateralParams) => {
    const { positionId, amount } = params;

    const position = deps.positionsQueries.getPositionById(positionId);
    if (!position) {
      throw new Error(`Position not found: ${positionId}`);
    }

    await deps.vaultCommands.decreasePosition({
      indexAsset: position.assetId,
      collateralDelta: amount.value.toString(),
      sizeDelta: '0',
      isLong: position.side === PositionSide.LONG,
      isFullClose: false,
    });
  };
