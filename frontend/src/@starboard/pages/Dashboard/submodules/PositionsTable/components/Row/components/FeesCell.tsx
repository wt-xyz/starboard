import { type FC, use } from 'react';
import { $decimalValue } from 'fuel-ts-sdk';
import { formatCurrency } from '@/lib/formatCurrency';
import { RowContext } from '@/pages/Dashboard/src/submodules/PositionsTable/components/Row/contexts/RowContext';
import { Cell } from '@/pages/Dashboard/src/submodules/PositionsTable/components/Row/components/common/Cell';

export const FeesCell: FC = () => {
  const position = use(RowContext)!;
  const liquidityFee = $decimalValue(position.outLiquidityFee).toFloat();
  const protocolFee = $decimalValue(position.outProtocolFee).toFloat();
  const liquidationFee = $decimalValue(position.outLiquidationFee).toFloat();
  const totalFees = liquidityFee + protocolFee + liquidationFee;

  return <Cell value={`$${formatCurrency(totalFees)}`} />;
};
