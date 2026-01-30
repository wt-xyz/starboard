import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SizeInput } from '../src/components/SizeInput';
import { SizeSlider } from '../src/components/SizeSlider';
import { Summary } from '../src/components/Summary';
import { TestWrapper, defaultFormProps } from './testUtils';

describe('Summary', () => {
  it('renders decrease amount and remaining size labels', () => {
    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <Summary />
      </TestWrapper>
    );

    expect(screen.getByText('Decrease Amount')).toBeInTheDocument();
    expect(screen.getByText('Remaining Size')).toBeInTheDocument();
  });

  it('shows full position size as remaining when no decrease amount', () => {
    render(
      <TestWrapper formProps={{ totalSize: '1000', onSubmit: vi.fn() }}>
        <Summary />
      </TestWrapper>
    );

    // Remaining should be 1000 (full size)
    expect(screen.getByText(/1,000/)).toBeInTheDocument();
  });

  it('shows 0 for empty decrease amount', () => {
    render(
      <TestWrapper
        formProps={{ totalSize: '500', onSubmit: vi.fn() }}
        meta={{ quoteAssetSymbol: 'USDC' }}
      >
        <Summary />
      </TestWrapper>
    );

    // Decrease amount is empty/0
    const decreaseLabel = screen.getByText('Decrease Amount');
    expect(decreaseLabel.nextElementSibling?.textContent).toMatch(/^0\s/);
  });

  it('calculates remaining size correctly when input is set', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '1000', onSubmit: vi.fn() }}>
        <SizeInput />
        <Summary />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '300');

    // Decrease amount should show 300
    expect(screen.getByText(/300/)).toBeInTheDocument();
    // Remaining should be 700
    expect(screen.getByText(/700/)).toBeInTheDocument();
  });

  it('shows zero remaining when decrease equals total', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '1000', onSubmit: vi.fn() }}>
        <SizeSlider />
        <Summary />
      </TestWrapper>
    );

    // Click 100% to decrease entire position
    await user.click(screen.getByRole('button', { name: '100%' }));

    // Remaining should be 0
    const remainingLabel = screen.getByText('Remaining Size');
    expect(remainingLabel.nextElementSibling?.textContent).toMatch(/^0\s/);
  });

  it('handles decimal decrease amounts', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '500', onSubmit: vi.fn() }}>
        <SizeInput />
        <Summary />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '100.5');

    expect(screen.getByText(/100\.5/)).toBeInTheDocument();
    expect(screen.getByText(/399\.5/)).toBeInTheDocument();
  });

  it('displays asset symbol from meta context', () => {
    render(
      <TestWrapper
        formProps={{ totalSize: '1000', onSubmit: vi.fn() }}
        meta={{ quoteAssetSymbol: 'ETH' }}
      >
        <Summary />
      </TestWrapper>
    );

    // Both values should show ETH suffix
    const ethTexts = screen.getAllByText(/ETH/);
    expect(ethTexts.length).toBe(2);
  });

  it('updates when slider percentage changes', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '100', onSubmit: vi.fn() }}>
        <SizeSlider />
        <Summary />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: '25%' }));

    // Check summary values specifically
    const decreaseLabel = screen.getByText('Decrease Amount');
    expect(decreaseLabel.nextElementSibling?.textContent).toMatch(/25/);

    const remainingLabel = screen.getByText('Remaining Size');
    expect(remainingLabel.nextElementSibling?.textContent).toMatch(/75/);
  });
});
