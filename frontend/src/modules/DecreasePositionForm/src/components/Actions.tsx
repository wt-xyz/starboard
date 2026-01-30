import type { FC } from 'react';
import { useBoolean } from 'usehooks-ts';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { FormContext } from '../contexts/FormContext';
import * as $ from './Actions.css';

export interface ActionsProps {
  submitTitleFn?: (percentage: string) => string;
}

export const Actions: FC<ActionsProps> = ({ submitTitleFn = () => 'Decrease Position' }) => {
  const { submitForm, isFormValid, getSizeDeltaAsPercentage } = useRequiredContext(FormContext);
  const isLocked = useBoolean(false);

  const percentage = getSizeDeltaAsPercentage();
  const submitTitle = submitTitleFn(percentage);

  const handleClick = async () => {
    isLocked.setTrue();
    try {
      await submitForm();
    } finally {
      isLocked.setFalse();
    }
  };

  const isInteractive = isLocked.value === false && isFormValid();

  return (
    <div className={$.buttonGroup}>
      <button type="button" className={$.cancelButton}>
        Cancel
      </button>

      <button
        type="button"
        className={$.decreaseButton}
        disabled={!isInteractive}
        onClick={handleClick}
      >
        {submitTitle}
      </button>
    </div>
  );
};
