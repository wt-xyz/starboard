import type { VaultCommands } from '@sdk/shared/contracts';
import type { DecimalValueInstance } from '@sdk/shared/models/DecimalValue';
import { CollateralAmount } from '@sdk/shared/models/decimals';
import type { AssetId } from '@sdk/shared/types';
import { DecimalCalculator } from '@sdk/shared/utils/DecimalCalculator';

export interface SubmitOrderParams {
  isLong: boolean;
  indexAsset: AssetId;
  collateralAssetId: AssetId;
  leverage: DecimalValueInstance;
  collateralAmount: CollateralAmount;
}

export interface SubmitOrderDependencies {
  vaultCommands: VaultCommands;
}

export const createSubmitOrder =
  (deps: SubmitOrderDependencies) => async (params: SubmitOrderParams) => {
    const { isLong, indexAsset, collateralAssetId, leverage, collateralAmount } = params;

    const sizeDelta = DecimalCalculator.value(collateralAmount)
      .multiplyBy(leverage)
      .calculate(CollateralAmount)
      .value.toString();

    await deps.vaultCommands.increasePosition({
      isLong,
      indexAsset,
      collateralAssetId,
      sizeDelta,
      collateralAmount: collateralAmount.value.toString(),
    });
  };
