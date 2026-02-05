import { type FC, use } from 'react';
import { useWatch } from 'react-hook-form';
import { formatNumber } from '@/lib/formatCurrency';
import { KernelContext, OptionsContext } from '../contexts';
import * as $ from './CurrentPositionInfo.css';

export const CurrentPositionInfo: FC = () => {
  const { control } = use(KernelContext)!;
  const { baseAssetSymbol, quoteAssetSymbol } = use(OptionsContext);

  const totalSize = useWatch({ control, name: 'totalSize' });

  return (
    <div css={$.positionInfo}>
      <div>
        <div css={$.positionInfoLabel}>Current Size</div>
        <div css={$.positionInfoValue}>
          {formatNumber(totalSize ?? '')} {quoteAssetSymbol}
        </div>
      </div>
      <div tw="text-right">
        <div css={$.positionInfoLabel}>Asset</div>
        <div css={$.positionInfoValue}>{baseAssetSymbol}</div>
      </div>
    </div>
  );
};
