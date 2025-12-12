import styled from 'styled-components';

import { PositionFundingDirection } from '@/bonsai/calculators/funding';
import { type BigNumberish } from '@/lib/numbers';

import { layoutMixins } from '@/styles/layoutMixins';

import { Icon, IconName } from './Icon';
import { Output, OutputType, ShowSign } from './Output';

type ElementProps = {
  direction: PositionFundingDirection;
  rate?: BigNumberish | null;
  className?: string;
};

const directionConfig: Record<
  PositionFundingDirection,
  { label: string; icon: IconName; color: string }
> = {
  pay: { label: 'Pay funding', icon: IconName.CautionCircle, color: 'var(--color-negative)' },
  receive: { label: 'Receive funding', icon: IconName.CheckCircle, color: 'var(--color-positive)' },
  flat: { label: 'No funding', icon: IconName.InfoStroke, color: 'var(--color-text-0)' },
};

export const FundingDirectionIndicator = ({ direction, rate, className }: ElementProps) => {
  const config = directionConfig[direction];

  return (
    <$Container className={className} $color={config.color}>
      <Icon iconName={config.icon} />
      <span>{config.label}</span>
      <Output
        type={OutputType.SmallPercent}
        value={rate}
        showSign={ShowSign.Both}
        minimumFractionDigits={4}
      />
    </$Container>
  );
};

const $Container = styled.div<{ $color: string }>`
  ${layoutMixins.inlineRow}
  gap: 0.375rem;
  color: ${({ $color }) => $color};
  font: var(--font-small-book);

  svg {
    width: 1em;
    height: 1em;
  }
`;

