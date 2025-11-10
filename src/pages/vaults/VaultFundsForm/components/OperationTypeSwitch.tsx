import { FC } from 'react';

import { ButtonAction, ButtonShape, ButtonSize } from '@/constants/buttons';
import { STRING_KEYS } from '@/constants/localization';

import { useLocaleGetter } from '@/hooks/useLocaleGetter';

import { ButtonProps } from '@/components/Button';

import $ from './OperationTypeSwitch.styles';

export interface OperationTypeSwitchProps {
  operationType: OperationType;
  onOperationTypeChange: (operationType: OperationType) => void;
}

export const OperationTypeSwitch: FC<OperationTypeSwitchProps> = ({
  onOperationTypeChange,
  operationType,
}) => {
  const { getLocale } = useLocaleGetter();

  function switchTo(operation: OperationType) {
    return () => onOperationTypeChange(operation);
  }

  return (
    <$.RootStyle>
      <$.TypeButton
        {...buttonProps}
        $active={operationType === OperationType.DEPOSIT}
        onClick={switchTo(OperationType.DEPOSIT)}
      >
        {getLocale({ key: STRING_KEYS.ADD_FUNDS })}
      </$.TypeButton>

      <$.TypeButton
        {...buttonProps}
        $active={operationType === OperationType.WITHDRAW}
        onClick={switchTo(OperationType.WITHDRAW)}
      >
        {getLocale({ key: STRING_KEYS.REMOVE_FUNDS })}
      </$.TypeButton>
    </$.RootStyle>
  );
};

const buttonProps = {
  shape: ButtonShape.Rectangle,
  size: ButtonSize.Base,
  action: ButtonAction.Navigation,
} satisfies ButtonProps;

export enum OperationType {
  DEPOSIT,
  WITHDRAW,
}
