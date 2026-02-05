import type { ComponentType, ReactNode } from 'react';
import type { PositionStableId } from 'fuel-ts-sdk';
import { propify } from '@/lib/propify';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { PositionStats } from '@/pages/Dashboard/submodules';
import { PositionCardContext } from '../../lib/PositionCardContext';
import * as $ from './_PositionStatsBase.css';

export const EntryPrice = propify(PositionStatBase, {
  label: 'Entry',
  Value: PositionStats.EntryPrice,
});

export const MarkPrice = propify(PositionStatBase, {
  label: 'Mark',
  Value: PositionStats.MarkPrice,
});

export const Collateral = propify(PositionStatBase, {
  label: 'Collateral',
  Value: PositionStats.Collateral,
});

export const Leverage = propify(PositionStatBase, {
  label: 'Leverage',
  Value: PositionStats.Leverage,
  prefix: '',
});

export interface PositionStatBaseProps {
  label: string;
  Value: ComponentType<{ positionId: PositionStableId }>;
  secondaryValue?: ReactNode;
  prefix?: string;
}

function PositionStatBase({ label, Value, secondaryValue, prefix = '$' }: PositionStatBaseProps) {
  const position = useRequiredContext(PositionCardContext);

  return (
    <div css={$.statCell}>
      <span css={$.statLabel}>{label}</span>
      <span css={$.statValue}>
        {prefix}
        <Value positionId={position.stableId} />
      </span>
      {secondaryValue && <span css={$.statValueSecondary}>{secondaryValue}</span>}
    </div>
  );
}
