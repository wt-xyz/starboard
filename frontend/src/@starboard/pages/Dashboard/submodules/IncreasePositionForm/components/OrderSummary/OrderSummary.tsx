import { type FC, use, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { formatCurrency } from '@/lib/formatCurrency';
import { KernelContext } from '@/pages/Dashboard/src/submodules/IncreasePositionForm/src/contexts/KernelContext';
import { OptionsContext } from '@/pages/Dashboard/src/submodules/IncreasePositionForm/src/contexts/OptionsContext';
import * as $ from './OrderSummary.css';

const SLIPPAGE_PRESETS = ['0.1', '0.3', '0.5', '1.0'] as const;
// TODO: Import MAX_LEVERAGE and FEE_RATE from SDK/contract constants
const MAX_LEVERAGE = 50;
const FEE_RATE = 0.004;

export const OrderSummary: FC = () => {
  const { control } = use(KernelContext)!;
  const { currentQuoteAssetPrice } = use(OptionsContext);

  const [orderSide, collateralSize, leverage] = useWatch({
    control,
    name: ['orderSide', 'collateralSize', 'leverage'],
  });

  // TODO: Wire slippage to SDK decreasePosition/increasePosition call
  const [slippage, setSlippage] = useState('0.3');
  const [isCustomSlippage, setIsCustomSlippage] = useState(false);
  const [customSlippageInput, setCustomSlippageInput] = useState('');

  const collateral = parseFloat(collateralSize ?? '');
  const lev = parseFloat(leverage ?? '');

  const currentPrice = currentQuoteAssetPrice.value;

  if (!collateral || !lev || collateral <= 0 || lev <= 0 || !currentPrice || currentPrice <= 0)
    return null;
  const positionNotional = collateral * lev;
  const minCollateral = positionNotional / MAX_LEVERAGE;
  const availableForLoss = collateral - minCollateral;
  const priceChange =
    availableForLoss > 0 ? (availableForLoss / positionNotional) * currentPrice : 0;
  const liqPrice = orderSide === 'long' ? currentPrice - priceChange : currentPrice + priceChange;
  const fee = positionNotional * FEE_RATE;

  const handlePresetClick = (preset: string) => {
    setSlippage(preset);
    setIsCustomSlippage(false);
  };

  const handleCustomClick = () => {
    setIsCustomSlippage(true);
    if (customSlippageInput) {
      setSlippage(customSlippageInput);
    }
  };

  const handleCustomBlur = () => {
    const val = parseFloat(customSlippageInput);
    if (!isNaN(val) && val >= 0.01 && val <= 50) {
      setSlippage(String(val));
    } else {
      setCustomSlippageInput(slippage);
    }
  };

  return (
    <div className={$.container}>
      <div className={$.row}>
        <span className={$.label}>Slippage Tolerance</span>
        <div className={$.slippageRow}>
          {SLIPPAGE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={$.slippageButton}
              data-active={!isCustomSlippage && slippage === preset}
              onClick={() => handlePresetClick(preset)}
            >
              {preset}%
            </button>
          ))}
          {isCustomSlippage ? (
            <>
              <input
                type="text"
                className={$.slippageInput}
                value={customSlippageInput}
                onChange={(e) => setCustomSlippageInput(e.target.value)}
                onBlur={handleCustomBlur}
                autoFocus
              />
              <span className={$.slippageSuffix}>%</span>
            </>
          ) : (
            <button
              type="button"
              className={$.slippageButton}
              data-active={isCustomSlippage}
              onClick={handleCustomClick}
            >
              Custom
            </button>
          )}
        </div>
      </div>

      <div className={$.row}>
        <span className={$.label}>Total Order Value</span>
        <span className={$.value}>{formatCurrency(positionNotional, { symbol: '$' })}</span>
      </div>

      <div className={$.row}>
        <span className={$.label}>Margin</span>
        <span className={$.value}>{formatCurrency(collateral, { symbol: '$' })}</span>
      </div>

      <div className={$.row}>
        <span className={$.label}>Liq. Price</span>
        <span className={$.value}>{formatCurrency(liqPrice, { symbol: '$' })}</span>
      </div>

      <div className={$.row}>
        <span className={$.label}>Est. Fee</span>
        <span className={$.value}>~{formatCurrency(fee, { symbol: '$' })}</span>
      </div>
    </div>
  );
};
