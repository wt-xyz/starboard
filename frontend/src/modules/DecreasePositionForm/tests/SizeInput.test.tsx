import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SizeInput } from '../src/components/SizeInput';
import { TestWrapper, defaultFormProps } from './testUtils';

describe('SizeInput', () => {
  it('renders with label and asset symbol from context', () => {
    render(
      <TestWrapper
        formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}
        meta={{ quoteAssetSymbol: 'USDC' }}
      >
        <SizeInput />
      </TestWrapper>
    );

    expect(screen.getByText('Amount to Decrease')).toBeInTheDocument();
    expect(screen.getByText('USDC')).toBeInTheDocument();
  });

  it('displays placeholder when empty', () => {
    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeInput />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('updates value when typing valid numeric input', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '100');

    expect(input).toHaveValue('100');
  });

  it('accepts decimal input', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '50.5');

    expect(input).toHaveValue('50.5');
  });

  it('rejects invalid characters', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, 'abc');

    expect(input).toHaveValue('');
  });

  it('truncates input to 13 characters', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '12345678901234567890');

    expect((input as HTMLInputElement).value.length).toBeLessThanOrEqual(13);
  });

  it('has decimal input mode for mobile keyboards', () => {
    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('0.00');
    expect(input).toHaveAttribute('inputMode', 'decimal');
  });

  it('clears to empty when user types 0', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '100');
    await user.clear(input);
    await user.type(input, '0');

    // '0' should be cleared to empty string
    expect(input).toHaveValue('');
  });
});
