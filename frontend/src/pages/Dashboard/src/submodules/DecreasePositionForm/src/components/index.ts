import { propify } from '@/lib/propify';
import { SizeInput as PositionFormSizeInput, SizePercentageSlider } from '@/modules/PositionForm';

export { SubmitButton, type SubmitButtonProps } from './SubmitButton';
export { CurrentPositionInfo } from './CurrentPositionInfo';
export { KernelProvider, type KernelProviderProps } from './KernelProvider';
export { Summary } from './Summary';

export const SizeInput = propify(PositionFormSizeInput, { label: 'Amount to Decrease' });

export { SizePercentageSlider };
