import type { FC, ReactNode } from 'react';
import { useMemo } from 'react';
import { $decimalValue, type PositionStableId } from 'fuel-ts-sdk';
import type { FieldErrors } from 'react-hook-form';
import { useSdkQuery, useSdkQuerySignal, useTradingSdk } from '@/lib/fuel-ts-sdk';
import type { Promiseable } from '@/types/Promiseable';
import { KernelProvider } from '../components/KernelProvider';
import { OptionsContext, type OptionsContextType } from '../contexts';
import type { EditCollateralFormModel } from '../models';

export interface FormProviderProps {
  children: ReactNode;
  positionId: PositionStableId;
  onSubmitFulfilled: (data: EditCollateralFormModel) => Promiseable<void>;
  onSubmitRejected?: (errors: FieldErrors<EditCollateralFormModel>) => void;
}

export const FormProvider: FC<FormProviderProps> = ({
  children,
  positionId,
  onSubmitFulfilled,
  onSubmitRejected,
}) => {
  const tradingSdk = useTradingSdk();

  const position = tradingSdk.getPositionById(positionId);
  if (!position) throw new Error('Position not found');

  const currentCollateral = $decimalValue(position.collateral).toFloat();

  const allAssets = useSdkQuery(tradingSdk.getAllAssets);
  const userBalances = useSdkQuery((sdk) => sdk.accounts.getCurrentUserBalances());

  const baseAsset = allAssets.find((asset) => asset.symbol === 'USDC');
  const userBalanceInBaseAsset = useMemo(() => {
    const assetId = baseAsset?.assetId;
    if (!assetId || !userBalances) return 0;
    if (!(assetId in userBalances)) return 0;
    return $decimalValue(userBalances[assetId]!).toFloat();
  }, [baseAsset?.assetId, userBalances]);

  const currentBaseAssetPrice = useSdkQuerySignal(() => {
    const price = tradingSdk.getBaseAssetLatestPrice();
    if (!price) return 1;
    return $decimalValue(price.value).toFloat();
  });

  const positionEquity = useSdkQuery((sdk) => sdk.trading.getPositionEquity(positionId));
  const withdrawMax = positionEquity ? Math.max(0, $decimalValue(positionEquity).toFloat()) : 0;

  const optionsValue = useMemo<OptionsContextType>(
    () => ({
      baseAssetSymbol: 'USDC',
      userBalanceInBaseAsset,
      currentCollateral,
      currentBaseAssetPrice,
    }),
    [userBalanceInBaseAsset, currentCollateral, currentBaseAssetPrice]
  );

  return (
    <OptionsContext.Provider value={optionsValue}>
      <KernelProvider
        depositMax={userBalanceInBaseAsset}
        withdrawMax={withdrawMax}
        onSubmitFulfilled={onSubmitFulfilled}
        onSubmitRejected={onSubmitRejected}
      >
        {children}
      </KernelProvider>
    </OptionsContext.Provider>
  );
};
