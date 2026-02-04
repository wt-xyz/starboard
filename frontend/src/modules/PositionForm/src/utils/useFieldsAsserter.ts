import { use } from 'react';
import { useWatch } from 'react-hook-form';
import { KernelContext } from '../contexts';
import type { PositionFormField } from '../models';

export function useFieldsAsserter(fields: PositionFormField[], componentName?: string) {
  const { control } = use(KernelContext)!;
  const values = useWatch({ control, name: fields });

  const missingFields = fields.filter((_, i) => values[i] === undefined);

  if (missingFields.length > 0) {
    throw new Error(
      `${componentName ?? 'Component'} requires fields: ${missingFields.join(', ')}. ` +
        `Make sure your form schema includes these fields.`
    );
  }
}
