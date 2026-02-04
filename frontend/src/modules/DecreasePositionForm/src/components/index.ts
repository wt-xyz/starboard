import { propify } from '@/lib/propify';
import { SizeInput as PositionFormSizeInput, SizePercentageSlider } from '@/modules/PositionForm';

export { Actions, type ActionsProps } from './Actions';
export { CurrentPositionInfo } from './CurrentPositionInfo';
export { KernelProvider, type KernelProviderProps } from './KernelProvider';
export { Summary } from './Summary';
export { SizePercentageSlider };

export const SizeInput = propify(PositionFormSizeInput, { label: 'Amount to Decrease' });
