import { ChangeEvent, useMemo, useState } from 'react';

import styled from 'styled-components';

import { BonsaiCore } from '@/bonsai/ontology';
import { ButtonAction, ButtonShape, ButtonSize } from '@/constants/buttons';
import { STRING_KEYS } from '@/constants/localization';

import { useBreakpoints } from '@/hooks/useBreakpoints';
import { useHistoricalPnlHistory } from '@/hooks/useHistoricalPnlHistory';
import { useStringGetter } from '@/hooks/useStringGetter';
import { useTradeHistory } from '@/hooks/useTradeHistory';
import { useAppSelector } from '@/state/appTypes';

import { layoutMixins } from '@/styles/layoutMixins';

import { Button } from '@/components/Button';
import { LoadingSpace, LoadingSpinner } from '@/components/Loading/LoadingSpinner';
import { Output, OutputType } from '@/components/Output';
import { FillsTable, FillsTableColumnKey } from '@/views/tables/FillsTable';

import breakpoints from '@/styles/breakpoints';

type SideFilter = 'ALL' | 'BUY' | 'SELL';

const PAGE_SIZES = [25, 50, 100];

export const TradeHistoryPanel = () => {
  const stringGetter = useStringGetter();
  const { isMobile, isTablet } = useBreakpoints();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [ticker, setTicker] = useState<string | undefined>();
  const [side, setSide] = useState<SideFilter>('ALL');
  const [startTime, setStartTime] = useState<string | undefined>();
  const [endTime, setEndTime] = useState<string | undefined>();

  const marketSummaries = useAppSelector(BonsaiCore.markets.markets.data) ?? {};
  const marketOptions = useMemo(
    () =>
      Object.values(marketSummaries)
        .map((m) => ({
          id: m?.assetId ?? '',
          label: m?.displayableAsset ?? m?.assetId ?? '',
        }))
        .filter((m) => m.id && m.label),
    [marketSummaries]
  );

  const { fills, totalResults, isLoading, error } = useTradeHistory({
    ticker,
    side: side === 'ALL' ? undefined : side,
    startTime,
    endTime,
    page,
    pageSize,
  });

  const { totalPnl, isLoading: pnlLoading } = useHistoricalPnlHistory({
    startTime,
    endTime,
  });

  const columnsDesktop = [
    FillsTableColumnKey.Time,
    FillsTableColumnKey.Market,
    FillsTableColumnKey.Side,
    FillsTableColumnKey.Type,
    FillsTableColumnKey.Liquidity,
    FillsTableColumnKey.Price,
    FillsTableColumnKey.AmountTag,
    FillsTableColumnKey.Total,
    FillsTableColumnKey.Fee,
  ];

  const columnsMobile = [
    FillsTableColumnKey.Time,
    FillsTableColumnKey.TypeAmount,
    FillsTableColumnKey.PriceFee,
  ];

  const totalPages = Math.max(1, Math.ceil((totalResults ?? fills.length) / pageSize));

  const handleInput =
    (setter: (value: string | undefined) => void) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value || undefined);
      setPage(1);
    };

  const showEmptyState = !isLoading && fills.length === 0;

  return (
    <$Container>
      <$FiltersSection>
        <$FilterRow>
          <$FilterGroup>
            <$Label>{stringGetter({ key: STRING_KEYS.ASSET })}</$Label>
            <$Select
              value={ticker ?? ''}
              onChange={(e) => {
                setTicker(e.target.value || undefined);
                setPage(1);
              }}
            >
              <option value="">{stringGetter({ key: STRING_KEYS.ALL })}</option>
              {marketOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </$Select>
          </$FilterGroup>

          {!isMobile && (
            <>
              <$FilterGroup>
                <$Label>{stringGetter({ key: STRING_KEYS.START_TIME })}</$Label>
                <$Input
                  type="datetime-local"
                  value={startTime ?? ''}
                  onChange={handleInput(setStartTime)}
                />
              </$FilterGroup>

              <$FilterGroup>
                <$Label>{stringGetter({ key: STRING_KEYS.END_TIME })}</$Label>
                <$Input type="datetime-local" value={endTime ?? ''} onChange={handleInput(setEndTime)} />
              </$FilterGroup>
            </>
          )}

          <$FilterGroup>
            <$Label>{stringGetter({ key: STRING_KEYS.SIDE })}</$Label>
            <$ButtonGroup>
              {(['ALL', 'BUY', 'SELL'] as SideFilter[]).map((s) => (
                <Button
                  key={s}
                  size={ButtonSize.Small}
                  shape={ButtonShape.Pill}
                  action={side === s ? ButtonAction.Primary : ButtonAction.Secondary}
                  onClick={() => {
                    setSide(s);
                    setPage(1);
                  }}
                >
                  {s}
                </Button>
              ))}
            </$ButtonGroup>
          </$FilterGroup>

          {!isTablet && (
            <$FilterGroup>
              <$Label>{stringGetter({ key: STRING_KEYS.PAGE_SIZE })}</$Label>
              <$ButtonGroup>
                {PAGE_SIZES.map((size) => (
                  <Button
                    key={size}
                    size={ButtonSize.Small}
                    shape={ButtonShape.Pill}
                    action={pageSize === size ? ButtonAction.Primary : ButtonAction.Secondary}
                    onClick={() => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </$ButtonGroup>
            </$FilterGroup>
          )}
        </$FilterRow>
      </$FiltersSection>

      <$StatsSection>
        <$StatCard>
          <$StatLabel>{stringGetter({ key: STRING_KEYS.TOTAL_PNL })}</$StatLabel>
          {pnlLoading ? (
            <LoadingSpinner size="20" />
          ) : (
            <$StatValue>
              <Output type={OutputType.Fiat} value={Number(totalPnl ?? 0)} fractionDigits={2} />
            </$StatValue>
          )}
        </$StatCard>

        <$StatCard>
          <$StatLabel>{stringGetter({ key: STRING_KEYS.TRADES })}</$StatLabel>
          <$StatValue>{totalResults ?? fills.length}</$StatValue>
          <$StatSubtext>
            {stringGetter({ key: STRING_KEYS.PAGE })} {page} / {totalPages}
          </$StatSubtext>
        </$StatCard>
      </$StatsSection>

      <$TableSection>
        <$TableHeader>
          <h3>{stringGetter({ key: STRING_KEYS.TRADE_HISTORY })}</h3>
          <$PaginationControls>
            <Button
              size={ButtonSize.Small}
              shape={ButtonShape.Pill}
              action={ButtonAction.Secondary}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {stringGetter({ key: STRING_KEYS.PREV })}
            </Button>
            <$PageIndicator>
              {page} / {totalPages}
            </$PageIndicator>
            <Button
              size={ButtonSize.Small}
              shape={ButtonShape.Pill}
              action={ButtonAction.Secondary}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {stringGetter({ key: STRING_KEYS.NEXT })}
            </Button>
          </$PaginationControls>
        </$TableHeader>

        {isLoading ? (
          <$LoadingContainer>
            <LoadingSpace id="trade-history-loading" />
          </$LoadingContainer>
        ) : error ? (
          <$ErrorContainer>
            <$ErrorMessage>{error.message}</$ErrorMessage>
          </$ErrorContainer>
        ) : showEmptyState ? (
          <$EmptyState>
            <$EmptyStateText>
              {stringGetter({ key: STRING_KEYS.TRADE_HISTORY_EMPTY_STATE })}
            </$EmptyStateText>
          </$EmptyState>
        ) : (
          <FillsTable
            columnKeys={isMobile ? columnsMobile : columnsDesktop}
            dataOverride={fills}
            withInnerBorders
            withOuterBorder
            initialPageSize={undefined}
          />
        )}
      </$TableSection>
    </$Container>
  );
};

const $Container = styled.div`
  ${layoutMixins.flexColumn}
  gap: 1.5rem;
  height: 100%;
  width: 100%;
  padding: 1rem;

  @media ${breakpoints.tablet} {
    padding: 0.75rem;
    gap: 1rem;
  }
`;

const $FiltersSection = styled.section`
  ${layoutMixins.flexColumn}
  gap: 1rem;
  padding: 1.25rem;
  background-color: var(--color-layer-3);
  border-radius: 0.875rem;

  @media ${breakpoints.tablet} {
    padding: 1rem;
  }
`;

const $FilterRow = styled.div`
  ${layoutMixins.flexWrap}
  gap: 1rem;
  align-items: flex-end;

  @media ${breakpoints.tablet} {
    gap: 0.75rem;
  }
`;

const $FilterGroup = styled.div`
  ${layoutMixins.flexColumn}
  gap: 0.5rem;
  min-width: 10rem;
  flex: 1;

  @media ${breakpoints.tablet} {
    min-width: 8rem;
  }
`;

const $Label = styled.label`
  color: var(--color-text-2);
  font: var(--font-small-book);
`;

const $Select = styled.select`
  background-color: var(--color-layer-2);
  color: var(--color-text-0);
  border: 1px solid var(--color-layer-6);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font: var(--font-base-book);
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-layer-7);
  }

  &:focus {
    outline: none;
    border-color: var(--color-border-primary);
  }
`;

const $Input = styled.input`
  background-color: var(--color-layer-2);
  color: var(--color-text-0);
  border: 1px solid var(--color-layer-6);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font: var(--font-base-book);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-layer-7);
  }

  &:focus {
    outline: none;
    border-color: var(--color-border-primary);
  }
`;

const $ButtonGroup = styled.div`
  ${layoutMixins.row}
  gap: 0.5rem;
`;

const $StatsSection = styled.section`
  ${layoutMixins.row}
  gap: 1rem;
  flex-wrap: wrap;

  @media ${breakpoints.tablet} {
    gap: 0.75rem;
  }
`;

const $StatCard = styled.div`
  ${layoutMixins.flexColumn}
  gap: 0.5rem;
  padding: 1.25rem;
  background-color: var(--color-layer-3);
  border-radius: 0.625rem;
  min-width: 12rem;
  flex: 1;

  @media ${breakpoints.tablet} {
    padding: 1rem;
    min-width: 10rem;
  }
`;

const $StatLabel = styled.div`
  color: var(--color-text-2);
  font: var(--font-small-book);
`;

const $StatValue = styled.div`
  color: var(--color-text-0);
  font: var(--font-large-medium);
`;

const $StatSubtext = styled.div`
  color: var(--color-text-2);
  font: var(--font-mini-book);
`;

const $TableSection = styled.section`
  ${layoutMixins.flexColumn}
  gap: 1rem;
  flex: 1;
  min-height: 0;
`;

const $TableHeader = styled.div`
  ${layoutMixins.spacedRow}
  align-items: center;

  h3 {
    color: var(--color-text-0);
    font: var(--font-medium-medium);
  }

  @media ${breakpoints.tablet} {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const $PaginationControls = styled.div`
  ${layoutMixins.row}
  gap: 0.75rem;
  align-items: center;
`;

const $PageIndicator = styled.span`
  color: var(--color-text-1);
  font: var(--font-base-book);
  min-width: 4rem;
  text-align: center;
`;

const $LoadingContainer = styled.div`
  ${layoutMixins.flexColumn}
  align-items: center;
  justify-content: center;
  min-height: 20rem;
  background-color: var(--color-layer-3);
  border-radius: 0.875rem;
`;

const $ErrorContainer = styled.div`
  ${layoutMixins.flexColumn}
  align-items: center;
  justify-content: center;
  min-height: 20rem;
  background-color: var(--color-layer-3);
  border-radius: 0.875rem;
`;

const $ErrorMessage = styled.div`
  color: var(--color-negative);
  font: var(--font-base-book);
`;

const $EmptyState = styled.div`
  ${layoutMixins.flexColumn}
  align-items: center;
  justify-content: center;
  min-height: 20rem;
  background-color: var(--color-layer-3);
  border-radius: 0.875rem;
`;

const $EmptyStateText = styled.div`
  color: var(--color-text-1);
  font: var(--font-base-book);
  text-align: center;
  max-width: 24rem;
`;
