import { type FC, use } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { useBoolean } from 'usehooks-ts';
import { calculateSliderPercentage } from '@/modules/PositionForm';
import { KernelContext } from '../contexts';
import * as $ from './SubmitButton.css';

export interface SubmitButtonProps {
  titleFn?: (percentage: string) => string;
}

export const SubmitButton: FC<SubmitButtonProps> = ({
  titleFn = (percentage) => (percentage === '100' ? 'Close' : 'Decrease'),
}) => {
  const { control, submit } = use(KernelContext)!;
  const { isValid } = useFormState({ control });
  const [sizeDelta, totalSize] = useWatch({ control, name: ['sizeDelta', 'totalSize'] });
  const isLocked = useBoolean(false);

  const percentage = calculateSliderPercentage(sizeDelta ?? '', totalSize ?? '');
  const title = titleFn(percentage);

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
