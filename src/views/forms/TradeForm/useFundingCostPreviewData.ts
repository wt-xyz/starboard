/**
 * Hook that provides funding cost preview data according to the FundingCostPreviewDataContract.
 *
 * This hook acts as an adapter between the current data sources (BonsaiHelpers, Redux selectors)
 * and the contract interface. When the underlying SDK/Bonsai wiring changes, only this hook
 * needs to be updated to fetch data from alternative sources while maintaining the same contract.
 */
import { useMemo } from 'react';

import { OrderSizeInputs } from '@/bonsai/forms/trade/types';
import { BonsaiHelpers } from '@/bonsai/ontology';
import { OrderSide } from 'starboard-client-js';

import { useAppSelector } from '@/state/appTypes';
import { getTradeFormSummary, getTradeFormValues } from '@/state/tradeFormSelectors';

import { MaybeBigNumber, MustBigNumber } from '@/lib/numbers';
import { orEmptyObj } from '@/lib/typeUtils';

import type { FundingCostPreviewDataContract } from './FundingCostPreview.contract';

/**
 * Extracts funding cost preview data from current data sources according to the contract.
 *
 * This function adapts the current data access pattern (BonsaiHelpers, Redux selectors)
 * to conform to the FundingCostPreviewDataContract interface.
 *
 * When the repository is no longer exported from the SDK, update this function to:
 * - Fetch funding rate from alternative SDK methods or API calls
 * - Get position notional from different sources
 * - Maintain the same contract interface so the component doesn't need changes
 *
 * @returns Data conforming to FundingCostPreviewDataContract
 */
export const useFundingCostPreviewData = (): FundingCostPreviewDataContract => {
  // Current implementation: Get funding rate from Bonsai-backed BonsaiHelpers selector
  const { nextFundingRate } = orEmptyObj(useAppSelector(BonsaiHelpers.currentMarket.marketInfo));

  // Current implementation: Get trade form values and summary from Redux
  const tradeValues = useAppSelector(getTradeFormValues);
  const tradeSummary = useAppSelector(getTradeFormSummary).summary;

  // Extract notional from trade form inputs
  const sizeSummary = orEmptyObj(tradeSummary.tradeInfo.inputSummary?.size);
  const rawUsdInput =
    tradeValues.size != null && OrderSizeInputs.is.USDC_SIZE(tradeValues.size)
      ? MaybeBigNumber(tradeValues.size.value.value)
      : null;
  const notionalInput = rawUsdInput ?? sizeSummary.usdcSize;
  const notional = notionalInput != null ? MustBigNumber(notionalInput) : null;

  // Build contract-compliant data structure
  return useMemo(
    () => ({
      fundingRate: {
        nextFundingRate,
      },
      positionNotional: {
        notional,
      },
      orderSide: {
        side: tradeValues.side ?? OrderSide.BUY,
      },
    }),
    [nextFundingRate, notional, tradeValues.side]
  );
};
