import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { timeUnits } from '@/constants/time';
import { IndexerHistoricalFundingResponse } from '@/types/indexer/indexerApiGen';

import { useAppSelector } from '@/state/appTypes';
import { getCurrentMarketIdIfTradeable } from '@/state/currentMarketSelectors';

import { isTruthy } from '@/lib/isTruthy';
import { MustBigNumber } from '@/lib/numbers';
import { orEmptyObj } from '@/lib/typeUtils';

import {
  filterHistoricalFundingByDays,
  getDateNDaysAgoISO,
  getDirectionFromFundingRate,
  HistoricalFundingObject,
  mapFundingChartObject,
} from '../calculators/funding';
import { Loadable } from '../lib/loadable';
import { mapLoadableData } from '../lib/mapLoadable';
import { wrapAndLogBonsaiError } from '../logs';
import { selectCurrentMarketInfo } from '../selectors/summary';
import { queryResultToLoadable } from './lib/queryResultToLoadable';
import { useIndexerClient } from './lib/useIndexer';

export const useCurrentMarketHistoricalFunding = ({
  limitTo90Days = false,
}: { limitTo90Days?: boolean } = {}): Loadable<HistoricalFundingObject[]> => {
  const { indexerClient, key: indexerKey } = useIndexerClient();
  const currentMarketId = useAppSelector(getCurrentMarketIdIfTradeable);
  const { nextFundingRate } = orEmptyObj(useAppSelector(selectCurrentMarketInfo));

  const historicalFundingQuery = useQuery({
    enabled: Boolean(currentMarketId) && Boolean(indexerClient),
    queryKey: ['historicalFunding', currentMarketId, indexerKey, limitTo90Days],
    queryFn: wrapAndLogBonsaiError(async () => {
      if (!currentMarketId) {
        throw new Error('Invalid marketId found');
      } else if (!indexerClient) {
        throw new Error('Indexer client not found');
      }

      const effectiveBeforeOrAt = limitTo90Days ? getDateNDaysAgoISO(90) ?? undefined : undefined;

      const result: IndexerHistoricalFundingResponse =
        // SDK typings do not yet expose query params for this endpoint
        await (
          indexerClient.markets.getPerpetualMarketHistoricalFunding as (
            marketId: string,
            params?: { effectiveBeforeOrAt?: string }
          ) => Promise<IndexerHistoricalFundingResponse>
        )(currentMarketId, { effectiveBeforeOrAt });

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const transformedData = result.historicalFunding?.map(mapFundingChartObject) ?? [];
      const filteredData = limitTo90Days
        ? filterHistoricalFundingByDays(transformedData, 90)
        : transformedData;

      return filteredData;
    }, 'currentMarketHistoricalFunding'),
    refetchInterval: timeUnits.hour,
    staleTime: timeUnits.hour,
  });

  const data = useMemo(() => {
    const combined = [
      ...(historicalFundingQuery.data ?? []),
      nextFundingRate != null && {
        fundingRate: MustBigNumber(nextFundingRate).toNumber(),
        time: Date.now(),
        direction: getDirectionFromFundingRate(nextFundingRate),
      },
    ].filter(isTruthy);

    return limitTo90Days ? filterHistoricalFundingByDays(combined, 90) : combined;
  }, [historicalFundingQuery.data, limitTo90Days, nextFundingRate]);

  return mapLoadableData(queryResultToLoadable(historicalFundingQuery), () => data);
};
