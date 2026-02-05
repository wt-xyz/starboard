import { use } from 'react';
import { Tabs } from 'radix-ui';
import { useController } from 'react-hook-form';
import { KernelContext } from '../contexts';
import { ORDER_SIDES } from '../models';
import * as styles from './OrderSideSwitch.css';

export function OrderSideSwitch() {
  const { control } = use(KernelContext)!;
  const { field } = useController({ control, name: 'orderSide' });

  return (
    <Tabs.Root value={field.value} onValueChange={field.onChange}>
      <Tabs.List css={styles.tabsList}>
        {ORDER_SIDES.map((side) => (
          <Tabs.Trigger key={side} value={side} css={styles.tabsTrigger} data-side={side}>
            {side.charAt(0).toUpperCase() + side.slice(1)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
