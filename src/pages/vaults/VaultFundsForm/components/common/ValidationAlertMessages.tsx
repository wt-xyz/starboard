import { FC, useMemo } from 'react';

import { ErrorType, ValidationError } from '@/bonsai/lib/validationErrors';
import { useFormState } from 'react-hook-form';
import tw from 'twin.macro';

import { AlertType } from '@/constants/alerts';
import { STRING_KEYS } from '@/constants/localization';

import { useLocaleGetter } from '@/hooks/useLocaleGetter';
import { useRequiredContext } from '@/hooks/useRequiredContext';
import { useURLConfigs } from '@/hooks/useURLConfigs';

import { AlertMessage } from '@/components/AlertMessage';
import { Link } from '@/components/Link';
import { Output, OutputType } from '@/components/Output';

import { VaultFormContext } from '../../contexts/VaultForm.context';
import { useVaultFundsValidationResult } from '../../hooks/useVaultFundsValidationResult';

export const ValidationAlertMessages: FC = () => {
  const { control } = useRequiredContext(VaultFormContext);
  const { isSubmitting } = useFormState({ control });
  const validationResponse = useVaultFundsValidationResult();
  const { getLocaleString } = useLocaleGetter();

  const errorsWithMessages = useMemo(
    () =>
      validationResponse.errors.flatMap<ErrorWithMessage>((error) => {
        if (error.code === 'SLIPPAGE_TOO_HIGH')
          return {
            ...error,
            message: (
              <SlippageTooHighMessage
                slippageAmount={validationResponse.summaryData.estimatedSlippage}
              />
            ),
          };

        const displayMessageKey = error.resources.text?.stringKey;
        if (!displayMessageKey) return [];

        return { ...error, message: getLocaleString({ key: displayMessageKey }) };
      }),
    [getLocaleString, validationResponse.errors, validationResponse.summaryData.estimatedSlippage]
  );

  function leaveOnlyWarningsUntilSubmitting(allErrors: ErrorWithMessage[]) {
    if (!isSubmitting) return allErrors.filter((e) => e.type === ErrorType.warning);
    return allErrors;
  }

  return errorsWithMessages.pipe(leaveOnlyWarningsUntilSubmitting).map((error) => (
    <AlertMessage
      key={error.code}
      type={error.type === ErrorType.error ? AlertType.Error : AlertType.Warning}
    >
      {error.message}
    </AlertMessage>
  ));
};

const SlippageTooHighMessage = ({ slippageAmount }: { slippageAmount?: number }) => {
  const urls = useURLConfigs();
  const { getLocaleString } = useLocaleGetter();

  return (
    <span>
      {getLocaleString({
        key: STRING_KEYS.SLIPPAGE_WARNING,
        params: {
          AMOUNT: <$.InlineOutput value={slippageAmount} type={OutputType.Percent} />,
          LINK: (
            <Link href={urls.vaultLearnMore} withIcon isInline>
              {getLocaleString({ key: STRING_KEYS.VAULT_FAQS })}
            </Link>
          ),
        },
      })}
    </span>
  );
};

interface ErrorWithMessage extends ValidationError {
  message: string | JSX.Element;
}

const $ = {
  InlineOutput: tw(Output)`inline`,
};
