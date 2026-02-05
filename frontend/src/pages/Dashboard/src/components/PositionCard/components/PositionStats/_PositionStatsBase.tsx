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

export interface PositionStatBaseProps {
  label: string;
  Value: ComponentType<{ positionId: PositionStableId }>;
  secondaryValue?: ReactNode;
}

function PositionStatBase({ label, Value, secondaryValue }: PositionStatBaseProps) {
  const position = useRequiredContext(PositionCardContext);

  return (
    <div css={$.statCell}>
      <span css={$.statLabel}>{label}</span>
      <span css={$.statValue}>
        $<Value positionId={position.stableId} />
      </span>
      {secondaryValue && <span css={$.statValueSecondary}>{secondaryValue}</span>}
    </div>
  );
}
