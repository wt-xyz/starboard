import { createContext } from 'react';
import type { Promiseable } from '@/types/Promiseable';
import type { DecreasePositionFormModel } from '../models';

export interface FormContextType {
  submitForm: () => Promiseable<void>;

  getFormData: () => DecreasePositionFormModel;
  getSizeDeltaAsPercentage: () => string;
  isFormValid: () => boolean;

  updateSizeDeltaFromNumeric: (valueNumeric: string) => void;
  updateSizeDeltaFromPercentage: (valueAsPercentage: string) => void;
}

export const FormContext = createContext<FormContextType | null>(null);
FormContext.displayName = 'FormContext';
