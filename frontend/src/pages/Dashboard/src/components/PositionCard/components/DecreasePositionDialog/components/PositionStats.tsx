import type { ComponentType } from 'react';
import type { PositionStableId } from 'fuel-ts-sdk';
import { propify } from '@/lib/propify';
import * as PositionStats from '@/pages/Dashboard/src/submodules/PositionStats';
import * as $ from './PositionStats.css';

export const EntryPriceStat = propify(PositionStatBase, {
  label: 'Entry',
  Value: PositionStats.EntryPrice,
});

export const MarkPriceStat = propify(PositionStatBase, {
  label: 'Mark',
  Value: PositionStats.MarkPrice,
});

export const LiquidationPriceStat = propify(PositionStatBase, {
  label: 'Liq.',
  Value: PositionStats.LiquidationPrice,
});

export interface PositionStatBaseProps {
  label: string;
  positionId: PositionStableId;
  Value: ComponentType<{ positionId: PositionStableId }>;
}

function PositionStatBase({ label, positionId, Value }: PositionStatBaseProps) {
  return (
    <div css={$.cell}>
      <span css={$.label}>{label}</span>
      <span css={$.value}>
        $<Value positionId={positionId} />
      </span>
    </div>
  );
}
