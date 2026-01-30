import type { FC } from 'react';
import { useContext } from 'react';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { formatNumber } from '@/lib/formatCurrency';
import { FormContext } from '../contexts/FormContext';
import { MetaContext } from '../contexts/MetaContext';
import * as $ from './CurrentPositionInfo.css';

export const CurrentPositionInfo: FC = () => {
  const { getFormData } = useRequiredContext(FormContext);
  const { baseAssetSymbol, quoteAssetSymbol } = useContext(MetaContext);

  const currentSize = getFormData().totalSizeNumeric;

  return (
    <div css={$.positionInfo}>
      <div>
        <div css={$.positionInfoLabel}>Current Size</div>
        <div css={$.positionInfoValue}>
          {formatNumber(currentSize)} {quoteAssetSymbol}
        </div>
      </div>
      <div tw="text-right">
        <div css={$.positionInfoLabel}>Asset</div>
        <div css={$.positionInfoValue}>{baseAssetSymbol}</div>
      </div>
    </div>
  );
};
