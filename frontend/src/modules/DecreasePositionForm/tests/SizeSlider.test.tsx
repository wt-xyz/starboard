import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SizeInput } from '../src/components/SizeInput';
import { SizeSlider } from '../src/components/SizeSlider';
import { TestWrapper, defaultFormProps } from './testUtils';

describe('SizeSlider', () => {
  it('renders with label and percentage value', () => {
    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeSlider />
      </TestWrapper>
    );

    expect(screen.getByText('Percentage')).toBeInTheDocument();
    // Initial value is 0% - check via slider aria attribute
    const slider = screen.getByRole('slider', { name: 'Decrease percentage' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('displays slider with current value', () => {
    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeSlider />
      </TestWrapper>
    );

    const slider = screen.getByRole('slider', { name: 'Decrease percentage' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders percentage mark buttons', () => {
    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeSlider />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: '0%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '25%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '75%' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '100%' })).toBeInTheDocument();
  });

  it('updates percentage when mark button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '100', onSubmit: vi.fn() }}>
        <SizeSlider />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: '50%' }));

    // Header should now show 50%
    const slider = screen.getByRole('slider', { name: 'Decrease percentage' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('sets 100% when clicking 100% mark', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '100', onSubmit: vi.fn() }}>
        <SizeSlider />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: '100%' }));

    const slider = screen.getByRole('slider', { name: 'Decrease percentage' });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
  });

  it('resets to 0% when clicking 0% mark after having a value', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '100', onSubmit: vi.fn() }}>
        <SizeSlider />
      </TestWrapper>
    );

    // First set to 50%
    await user.click(screen.getByRole('button', { name: '50%' }));
    // Then reset to 0%
    await user.click(screen.getByRole('button', { name: '0%' }));

    const slider = screen.getByRole('slider', { name: 'Decrease percentage' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('has correct aria label', () => {
    render(
      <TestWrapper formProps={{ ...defaultFormProps, onSubmit: vi.fn() }}>
        <SizeSlider />
      </TestWrapper>
    );

    expect(screen.getByRole('slider', { name: 'Decrease percentage' })).toBeInTheDocument();
  });

  it('syncs with SizeInput value', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '100', onSubmit: vi.fn() }}>
        <SizeInput />
        <SizeSlider />
      </TestWrapper>
    );

    // Type 50 in the input (50% of 100)
    const input = screen.getByPlaceholderText('0.00');
    await user.type(input, '50');

    // Slider should show 50%
    const slider = screen.getByRole('slider', { name: 'Decrease percentage' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('updates SizeInput when slider percentage changes', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper formProps={{ totalSize: '100', onSubmit: vi.fn() }}>
        <SizeInput />
        <SizeSlider />
      </TestWrapper>
    );

    // Click 25% button
    await user.click(screen.getByRole('button', { name: '25%' }));

    // Input should show 25 (25% of 100)
    const input = screen.getByPlaceholderText('0.00');
    expect(input).toHaveValue('25');
  });
});
