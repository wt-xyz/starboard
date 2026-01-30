import type { FC, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { DecreasePositionFormSchema, type DecreasePositionFormModel } from '../models';
import { FormContext, type FormContextType } from './FormContext';
import {
  calculateSizeFromPercentage,
  calculateSliderPercentage,
} from './FormContext.Provider.utils';

export interface FormContextProviderProps {
  totalSize: string;
  onSubmit: (formData: DecreasePositionFormModel) => void;
  children: ReactNode;
}

export const FormContextProvider: FC<FormContextProviderProps> = ({
  children,
  onSubmit,
  totalSize,
}) => {
  const [sizeDelta, setSizeDelta] = useState('');

  const getFormData = useCallback(
    (): DecreasePositionFormModel => ({
      totalSizeNumeric: totalSize,
      sizeDeltaNumeric: sizeDelta,
    }),
    [totalSize, sizeDelta]
  );

  const getSizeDeltaAsPercentage = useCallback(
    () => calculateSliderPercentage(sizeDelta, totalSize),
    [sizeDelta, totalSize]
  );

  const isFormValid = useCallback(
    () => DecreasePositionFormSchema.safeParse(getFormData()).success,
    [getFormData]
  );

  const updateSizeDeltaFromNumeric = useCallback((valueNumeric: string) => {
    if (valueNumeric === '0') {
      setSizeDelta('');
    } else {
      setSizeDelta(valueNumeric);
    }
  }, []);

  const updateSizeDeltaFromPercentage = useCallback(
    (valueAsPercentage: string) => {
      const newSize = calculateSizeFromPercentage(valueAsPercentage, totalSize);
      setSizeDelta(newSize === '0' ? '' : newSize);
    },
    [totalSize]
  );

  const submitForm = useCallback(() => {
    onSubmit(getFormData());
  }, [getFormData, onSubmit]);

  const contextValue = useMemo<FormContextType>(
    () => ({
      submitForm,
      getFormData,
      getSizeDeltaAsPercentage,
      isFormValid,
      updateSizeDeltaFromNumeric,
      updateSizeDeltaFromPercentage,
    }),
    [
      submitForm,
      getFormData,
      getSizeDeltaAsPercentage,
      isFormValid,
      updateSizeDeltaFromNumeric,
      updateSizeDeltaFromPercentage,
    ]
  );

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
};
