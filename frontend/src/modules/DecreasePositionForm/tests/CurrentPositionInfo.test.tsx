import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CurrentPositionInfo } from '../src/components/CurrentPositionInfo';
import { TestWrapper } from './testUtils';

describe('CurrentPositionInfo', () => {
  it('renders current size label and value', () => {
    render(
      <TestWrapper formProps={{ totalSize: '1000', onSubmit: vi.fn() }}>
        <CurrentPositionInfo />
      </TestWrapper>
    );

    expect(screen.getByText('Current Size')).toBeInTheDocument();
    expect(screen.getByText(/1,000/)).toBeInTheDocument();
  });

  it('renders asset label and symbol from meta context', () => {
    render(
      <TestWrapper
        formProps={{ totalSize: '1000', onSubmit: vi.fn() }}
        meta={{ baseAssetSymbol: 'BTC' }}
      >
        <CurrentPositionInfo />
      </TestWrapper>
    );

    expect(screen.getByText('Asset')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
  });

  it('displays quote asset symbol with size', () => {
    render(
      <TestWrapper
        formProps={{ totalSize: '500', onSubmit: vi.fn() }}
        meta={{ quoteAssetSymbol: 'USDC' }}
      >
        <CurrentPositionInfo />
      </TestWrapper>
    );

    expect(screen.getByText(/500.*USDC/)).toBeInTheDocument();
  });

  it('formats large numbers with commas', () => {
    render(
      <TestWrapper formProps={{ totalSize: '1234567.89', onSubmit: vi.fn() }}>
        <CurrentPositionInfo />
      </TestWrapper>
    );

    expect(screen.getByText(/1,234,567/)).toBeInTheDocument();
  });

  it('uses default meta values when not provided', () => {
    render(
      <TestWrapper formProps={{ totalSize: '100', onSubmit: vi.fn() }}>
        <CurrentPositionInfo />
      </TestWrapper>
    );

    // Default values from MetaContext are empty strings
    expect(screen.getByText('Current Size')).toBeInTheDocument();
    expect(screen.getByText('Asset')).toBeInTheDocument();
  });
});
