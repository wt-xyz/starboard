import { use } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { KernelContext } from '../contexts';
import * as styles from './SubmitButton.css';

export function SubmitButton() {
  const { control, submit } = use(KernelContext)!;
  const orderSide = useWatch({ control, name: 'orderSide' });

  const formState = useFormState({ control });

  return (
    <button
      type="button"
      css={[
        styles.button,
        orderSide === 'long' ? styles.buyButton : styles.sellButton,
        !formState.isValid && styles.disabledButton,
      ]}
      onClick={submit}
    >
      Open Position
    </button>
  );
}
