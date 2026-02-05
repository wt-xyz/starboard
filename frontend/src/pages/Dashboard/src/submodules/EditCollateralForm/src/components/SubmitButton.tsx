import { type FC, use } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { useBoolean } from 'usehooks-ts';
import { KernelContext } from '../contexts';
import * as $ from './SubmitButton.css';

export const SubmitButton: FC = () => {
  const { control, submit } = use(KernelContext)!;
  const { isValid } = useFormState({ control });
  const action = useWatch({ control, name: 'action' });
  const isLocked = useBoolean(false);

  const title = action === 'deposit' ? 'Deposit' : 'Withdraw';

  const handleSubmit = async () => {
    isLocked.setTrue();
    try {
      await submit();
    } finally {
      isLocked.setFalse();
    }
  };

  const looksDisabled = isLocked.value || !isValid;

  return (
    <button
      type="button"
      css={[$.button, looksDisabled && $.disabled]}
      disabled={isLocked.value}
      onClick={handleSubmit}
    >
      {title}
    </button>
  );
};
