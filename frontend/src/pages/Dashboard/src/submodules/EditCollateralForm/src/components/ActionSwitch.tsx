import { type FC, use } from 'react';
import { SegmentedControl } from '@radix-ui/themes';
import { useController } from 'react-hook-form';
import { KernelContext } from '../contexts';
import type { CollateralAction } from '../models';

export const ActionSwitch: FC = () => {
  const { control } = use(KernelContext)!;
  const { field } = useController({ control, name: 'action' });

  return (
    <SegmentedControl.Root
      value={field.value}
      onValueChange={(value) => field.onChange(value as CollateralAction)}
    >
      <SegmentedControl.Item value="deposit">Deposit</SegmentedControl.Item>
      <SegmentedControl.Item value="withdraw">Withdraw</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
};
