import { useQuery } from '@tanstack/react-query';

import { timeUnits } from '@/constants/time';
import {
  IndexerFundingPaymentResponse,
  IndexerFundingPaymentResponseObject,
} from '@/types/indexer/indexerApiGen';

import { getSubaccountId, getUserWalletAddress } from '@/state/accountInfoSelectors';
import { useAppSelector } from '@/state/appTypes';

import { getDateNDaysAgoISO, getTimestampNDaysAgo } from '../calculators/funding';
import { Loadable } from '../lib/loadable';
import { wrapAndLogBonsaiError } from '../logs';
import { queryResultToLoadable } from './lib/queryResultToLoadable';
import { useIndexerClient } from './lib/useIndexer';

export const useFundingPayments = ({
  limitTo90Days = false,
  ticker,
}: {
  limitTo90Days?: boolean;
  ticker?: string;
} = {}): Loadable<IndexerFundingPaymentResponseObject[]> => {
  const { indexerClient, key: indexerKey } = useIndexerClient();
  const address = useAppSelector(getUserWalletAddress);
  const subaccountNumber = useAppSelector(getSubaccountId);

  const fundingPaymentsQuery = useQuery({
    enabled: Boolean(indexerClient) && Boolean(address) && subaccountNumber != null,
    queryKey: ['fundingPayments', address, subaccountNumber, indexerKey, limitTo90Days, ticker],
    queryFn: wrapAndLogBonsaiError(async () => {
      if (!indexerClient) {
        throw new Error('Indexer client not found');
      } else if (!address) {
        throw new Error('Address not found');
      } else if (subaccountNumber == null) {
        throw new Error('Subaccount number not found');
      }

      const afterOrAt = limitTo90Days ? getDateNDaysAgoISO(90) : undefined;

      const result: IndexerFundingPaymentResponse =
        // SDK typings do not yet expose query params for this endpoint
        await (
          indexerClient.account.getParentSubaccountNumberFundingPayments as (
            address: string,
            subaccountNumber: number,
            params?: { afterOrAt?: string; ticker?: string }
          ) => Promise<IndexerFundingPaymentResponse>
        )(address, subaccountNumber, {
          ...(afterOrAt ? { afterOrAt } : {}),
          ...(ticker ? { ticker } : {}),
        });

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const payments = result.fundingPayments?.reverse() ?? [];
      if (!limitTo90Days && !ticker) {
        return payments;
      }

      const cutoff = limitTo90Days ? getTimestampNDaysAgo(90) : null;

      return payments.filter((payment) => {
        const createdAtMs = new Date(payment.createdAt).getTime();
        if (Number.isNaN(createdAtMs)) {
          return false;
        }

        if (cutoff != null && createdAtMs < cutoff) {
          return false;
        }

        if (ticker && payment.ticker !== ticker) {
          return false;
        }

        return true;
      });
    }, 'fundingPayments'),
    refetchInterval: 10 * timeUnits.minute,
    staleTime: timeUnits.hour,
  });

  return queryResultToLoadable(fundingPaymentsQuery);
};
