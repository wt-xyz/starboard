import { useMemo } from 'react';

import {
  calculateFundingProjections,
  getPositionFundingDirection,
} from '@/bonsai/calculators/funding';
import styled from 'styled-components';

import { layoutMixins } from '@/styles/layoutMixins';

import { Details, type DetailsItem } from '@/components/Details';
import { FundingDirectionIndicator } from '@/components/FundingDirectionIndicator';
import { Icon, IconName } from '@/components/Icon';
import { Output, OutputType, ShowSign } from '@/components/Output';

import { MustBigNumber } from '@/lib/numbers';

import { hasCompleteFundingCostData } from './FundingCostPreview.contract';
import { useFundingCostPreviewData } from './useFundingCostPreviewData';

const EXTREME_RATE_THRESHOLD = 0.001; // 0.10% per 8h

export const FundingCostPreview = () => {
  // Get data through the contract interface
  const fundingData = useFundingCostPreviewData();

  // Extract values from contract-compliant data structure
  const { nextFundingRate } = fundingData.fundingRate;
  const { notional } = fundingData.positionNotional;
  const { side } = fundingData.orderSide;

  const fundingDirection = getPositionFundingDirection(side, nextFundingRate);

  const projections = useMemo(() => {
    // Use type guard to ensure data is available before calculations
    if (!hasCompleteFundingCostData(fundingData)) {
      return null;
    }
    return calculateFundingProjections(
      fundingData.positionNotional.notional,
      fundingData.fundingRate.nextFundingRate
    );
  }, [fundingData]);

  const projectionItems: DetailsItem[] = [
    {
      key: 'projection-1d',
      label: '1 day',
      value: (
        <Output
          type={OutputType.Fiat}
          value={projections?.oneDay}
          showSign={ShowSign.Both}
          fractionDigits={6}
          useGrouping
        />
      ),
    },
    {
      key: 'projection-7d',
      label: '7 days',
      value: (
        <Output
          type={OutputType.Fiat}
          value={projections?.sevenDays}
          showSign={ShowSign.Both}
          fractionDigits={6}
          useGrouping
        />
      ),
    },
    {
      key: 'projection-30d',
      label: '30 days',
      value: (
        <Output
          type={OutputType.Fiat}
          value={projections?.thirtyDays}
          showSign={ShowSign.Both}
          fractionDigits={6}
          useGrouping
        />
      ),
    },
  ];

  const fundingRateBN = MustBigNumber(nextFundingRate);
  const isExtremeRate = nextFundingRate != null && fundingRateBN.abs().gt(EXTREME_RATE_THRESHOLD);

  const currentFundingItems: DetailsItem[] = [
    {
      key: 'funding-rate',
      label: 'Funding rate (8h)',
      value: (
        <Output
          type={OutputType.SmallPercent}
          value={nextFundingRate}
          showSign={ShowSign.Both}
          minimumFractionDigits={4}
        />
      ),
    },
    {
      key: 'funding-direction',
      label: 'Funding direction',
      value: <FundingDirectionIndicator direction={fundingDirection} rate={nextFundingRate} />,
    },
    {
      key: 'notional',
      label: 'Position notional',
      value: <Output type={OutputType.Fiat} value={notional} useGrouping />,
    },
  ];

  return (
    <$Container>
      <$Header>
        <Icon iconName={IconName.Calculator} />
        <span>Funding cost preview</span>
      </$Header>

      <$DetailsSection items={currentFundingItems} layout="stackColumn" />

      <$ProjectionsSection>
        <$ProjectionsHeader>Projections</$ProjectionsHeader>
        <$ProjectionDetails items={projectionItems} layout="stackColumn" />
      </$ProjectionsSection>

      {isExtremeRate && (
        <$Warning>
          <Icon iconName={IconName.CautionCircle} />
          <div>
            <strong>High funding rate</strong>
            <p>Rates above 0.10% per 8h may result in large funding swings.</p>
          </div>
        </$Warning>
      )}
    </$Container>
  );
};

const $Container = styled.div`
  ${layoutMixins.column}
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-layer-5);
  background: var(--color-layer-1);
`;

const $Header = styled.div`
  ${layoutMixins.inlineRow}
  gap: 0.5rem;
  color: var(--color-text-1);
  font: var(--font-small-semibold);

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const $DetailsSection = styled(Details)`
  width: 100%;
`;

const $ProjectionsSection = styled.div`
  ${layoutMixins.column}
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-layer-5);
`;

const $ProjectionsHeader = styled.h3`
  margin: 0;
  color: var(--color-text-1);
  font: var(--font-small-semibold);
`;

const $ProjectionDetails = styled(Details)`
  width: 100%;
  --details-item-vertical-padding: 0.75rem;
  gap: 0.75rem;

  > * {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.375rem;
    background: var(--color-layer-2);
    transition: background-color 0.2s;

    &:hover {
      background: var(--color-layer-3);
    }
  }
`;

const $Warning = styled.div`
  ${layoutMixins.inlineRow}
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: var(--color-layer-3);
  color: var(--color-text-1);

  svg {
    width: 1rem;
    height: 1rem;
    color: var(--color-negative);
  }

  p {
    margin: 0;
    color: var(--color-text-0);
    font: var(--font-small-book);
  }

  strong {
    display: block;
    font: var(--font-small-semibold);
  }
`;
