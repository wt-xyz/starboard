import { type FC, use } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { useBoolean } from 'usehooks-ts';
import { calculateSliderPercentage } from '@/modules/PositionForm';
import { KernelContext } from '../contexts';
import * as $ from './Actions.css';

export interface ActionsProps {
  onCancel?: () => void;
  submitTitleFn?: (percentage: string) => string;
}

export const Actions: FC<ActionsProps> = ({
  onCancel,
  submitTitleFn = () => 'Decrease Position',
}) => {
  const { control, submit } = use(KernelContext)!;
  const { isValid } = useFormState({ control });
  const [sizeDelta, totalSize] = useWatch({ control, name: ['sizeDelta', 'totalSize'] });
  const isLocked = useBoolean(false);

  const percentage = calculateSliderPercentage(sizeDelta ?? '', totalSize ?? '');
  const submitTitle = submitTitleFn(percentage);

  const handleSubmit = async () => {
    isLocked.setTrue();
    try {
      await submit();
    } finally {
      isLocked.setFalse();
    }
  };

  const isInteractive = !isLocked.value && isValid;

  return (
    <div className={$.buttonGroup}>
      <button type="button" className={$.cancelButton} onClick={onCancel}>
        Cancel
      </button>

      <button
        type="button"
        className={$.decreaseButton}
        disabled={!isInteractive}
        onClick={handleSubmit}
      >
        {submitTitle}
      </button>
    </div>
  );
};
