import { type FC, use, useCallback, useEffect, useRef, useState } from 'react';
import { $decimalValue, DecimalCalculator, DecimalValue, Usdc } from 'fuel-ts-sdk';
import { useController, useWatch } from 'react-hook-form';
import { SizeInput } from '@/modules/PositionForm';
import { KernelContext, OptionsContext } from '../../contexts';
import type { OrderEntryFormModel } from '../../models';

export const PositionSizeInputs: FC = () => {
  const { control } = use(KernelContext)!;
  const {
    currentQuoteAssetPrice,
    currentBaseAssetPrice,
    quoteAssetSymbol,
    userBalanceInBaseAsset,
  } = use(OptionsContext)!;
  const collateralSize = useController({ control, name: 'collateralSize' });
  const positionSize = useController({ control, name: 'positionSize' });
  const leverage = useWatch({ control, name: 'leverage', compute: (v) => +(v ?? 10) });
  const orderSide = useWatch({ control, name: 'orderSide' });

  const collateralRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);
  const [focusedField, setFocusedField] = useState<keyof OrderEntryFormModel>();

  useEffect(() => {
    const collateralEl = collateralRef.current;
    const positionEl = positionRef.current;
    const handleCollateralFocus = () => setFocusedField('collateralSize');
    const handlePositionFocus = () => setFocusedField('positionSize');

    collateralEl?.addEventListener('focus', handleCollateralFocus);
    positionEl?.addEventListener('focus', handlePositionFocus);
    return () => {
      collateralEl?.removeEventListener('focus', handleCollateralFocus);
      positionEl?.removeEventListener('focus', handlePositionFocus);
    };
  }, []);

  const updateCollateralSize = useCallback(
    (val: string) => {
      if (isNaN(+val)) return;
      collateralSize.field.onChange(String(val.trim()));
    },
    [collateralSize.field]
  );
  const updatePositionSize = useCallback(
    (val: string) => {
      if (isNaN(+val)) return;
      positionSize.field.onChange(String(val.trim()));
    },
    [positionSize.field]
  );

  useEffect(() => {
    if (!positionSize.field.value && !collateralSize.field.value) return;
    const leverageDv = DecimalValue.fromFloat(leverage);
    const quoteAssetPriceDv = DecimalValue.fromFloat(currentQuoteAssetPrice.value);

    if (focusedField === 'collateralSize' || !focusedField) {
      if (!collateralSize.field.value) {
        updatePositionSize('');
        return;
      }
      const collateralSizeDv = DecimalValue.fromDecimalString(collateralSize.field.value);

      const nextPositionSize = $decimalValue(
        DecimalCalculator.inNumerator((d) => d.value(collateralSizeDv).multiplyBy(leverageDv))
          .inDenominator((n) => n.value(quoteAssetPriceDv))
          .calculate()
      ).toDecimalString();

      updatePositionSize(nextPositionSize);
    }
    if (focusedField === 'positionSize') {
      if (!positionSize.field.value) {
        updateCollateralSize('');
        return;
      }
      const positionSizeDv = DecimalValue.fromDecimalString(positionSize.field.value);
      const nextCollateralSize = $decimalValue(
        DecimalCalculator.inNumerator((calc) =>
          calc.value(positionSizeDv).multiplyBy(quoteAssetPriceDv)
        )
          .inDenominator((calc) => calc.value(leverageDv))
          .calculate(DecimalValue)
      ).toDecimalString();
      updateCollateralSize(nextCollateralSize);
    }
  }, [
    collateralSize.field.value,
    currentQuoteAssetPrice.value,
    focusedField,
    leverage,
    positionSize.field.value,
    updateCollateralSize,
    updatePositionSize,
  ]);

  const handleAllIn = useCallback(() => {
    setFocusedField('collateralSize');
    updateCollateralSize($decimalValue(Usdc.fromFloat(userBalanceInBaseAsset)).toDecimalString());
  }, [updateCollateralSize, userBalanceInBaseAsset]);

  const handleHalfIn = useCallback(() => {
    setFocusedField('collateralSize');
    updateCollateralSize(
      $decimalValue(Usdc.fromFloat(userBalanceInBaseAsset / 2)).toDecimalString()
    );
  }, [updateCollateralSize, userBalanceInBaseAsset]);

  return (
    <>
      <SizeInput
        ref={collateralRef}
        fieldName="collateralSize"
        label="Pay"
        assetSymbol="USDC"
        assetPrice={currentBaseAssetPrice.value}
        onHalf={handleHalfIn}
        onMax={handleAllIn}
        calculateUsdValue={calculateCollateralUsdValue}
      />
      <SizeInput
        ref={positionRef}
        fieldName="positionSize"
        label={orderSide}
        assetSymbol={quoteAssetSymbol}
        assetPrice={currentQuoteAssetPrice.value}
        showLeverage
        onMax={handleAllIn}
        calculateUsdValue={calculatePositionUsdValue}
      />
    </>
  );
};

function calculateCollateralUsdValue(fieldValue: string) {
  return fieldValue || null;
}

function calculatePositionUsdValue(fieldValue: string, assetPrice: number) {
  if (!fieldValue) return null;
  return $decimalValue(
    DecimalCalculator.value(DecimalValue.fromDecimalString(fieldValue))
      .multiplyBy(DecimalValue.fromFloat(assetPrice))
      .calculate(DecimalValue)
  ).toDecimalString();
}
