import { type FC, use, useMemo } from 'react';
import {
  $decimalValue,
  CollateralAmount,
  DecimalCalculator,
  type DecimalValueInstance,
  type PositionStableId,
} from 'fuel-ts-sdk';
import {
  ASSETS_MAX_LEVERAGE,
  calculateLeverageForCollateral,
  calculateLiquidationPriceForCollateral,
} from 'fuel-ts-sdk/trading';
import { useWatch } from 'react-hook-form';
import { formatCurrency } from '@/lib/formatCurrency';
import { useTradingSdk } from '@/lib/fuel-ts-sdk';
import { EditCollateralForm } from '@/pages/Dashboard/submodules';
import * as $ from './Summary.css';

export interface SummaryProps {
  positionId: PositionStableId;
}

export const Summary: FC<SummaryProps> = ({ positionId }) => {
  const tradingSdk = useTradingSdk();
  const { control } = use(EditCollateralForm.KernelContext)!;

  const position = tradingSdk.getPositionById(positionId);
  if (!position) throw new Error('No position found');

  const [action, amountStr] = useWatch({ control, name: ['action', 'amount'] });

  const currentLeverage = tradingSdk.getPositionLeverage(positionId);
  const currentLiquidationPrice = tradingSdk.getPositionLiquidationPriceApprox(positionId);

  const { newLeverage, newLiquidationPrice } = useMemo(() => {
    const amount = amountStr ? CollateralAmount.fromDecimalString(amountStr) : null;
    if (!amount || amount.value === '0') {
      return { newLeverage: currentLeverage, newLiquidationPrice: currentLiquidationPrice };
    }

    const newCollateral =
      action === 'deposit'
        ? DecimalCalculator.value(position.collateral).add(amount).calculate(CollateralAmount)
        : DecimalCalculator.value(position.collateral)
            .subtractBy(amount)
            .calculate(CollateralAmount);

    if (BigInt(newCollateral.value) <= 0n) {
      return { newLeverage: null, newLiquidationPrice: null };
    }

    const leverage = calculateLeverageForCollateral(position, newCollateral);
    const liqPrice = calculateLiquidationPriceForCollateral(
      position,
      newCollateral,
      ASSETS_MAX_LEVERAGE
    );

    return { newLeverage: leverage, newLiquidationPrice: liqPrice };
  }, [action, amountStr, position, currentLeverage, currentLiquidationPrice]);

  const formatLeverage = (lev: DecimalValueInstance | null | undefined) => {
    if (!lev) return '—';
    return `${$decimalValue(lev).toFloat().toFixed(1)}x`;
  };

  const formatPrice = (price: DecimalValueInstance | null | undefined) => {
    if (!price) return '—';
    return formatCurrency($decimalValue(price).toFloat());
  };

  const hasChange = amountStr && amountStr !== '0' && amountStr !== '';

  return (
    <div className={$.container}>
      <div className={$.row}>
        <span className={$.label}>Leverage</span>
        <span className={$.value}>
          {formatLeverage(currentLeverage)}
          {hasChange && (
            <>
              <span className={$.arrow}>→</span>
              {formatLeverage(newLeverage)}
            </>
          )}
        </span>
      </div>
      <div className={$.row}>
        <span className={$.label}>Liq. Price</span>
        <span className={$.value}>
          ${formatPrice(currentLiquidationPrice)}
          {hasChange && (
            <>
              <span className={$.arrow}>→</span>${formatPrice(newLiquidationPrice)}
            </>
          )}
        </span>
      </div>
    </div>
  );
};
