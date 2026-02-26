import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectWalletButton } from '../../src/views/DashboardLayout/components/DashboardHeader/components/ConnectWalletButton';

const mockEstablishConnection = vi.fn();
let mockAccount: string | null = null;
let mockIsConnected = false;

vi.mock('@fuels/react', () => ({
  useAccount: () => ({ account: mockAccount }),
}));

vi.mock('@/contexts/WalletContext', () => ({
  WalletContext: { _currentValue: null, displayName: 'WalletContext' },
}));

vi.mock('@/lib/useRequiredContext', () => ({
  useRequiredContext: () => ({
    establishConnection: mockEstablishConnection,
    isUserConnected: () => mockIsConnected,
  }),
}));

vi.mock('@/lib/hooks/useAutoFaucet', () => ({
  useAutoFaucet: vi.fn(),
}));

vi.mock(
  '../../src/views/DashboardLayout/components/DashboardHeader/components/ConnectWalletButton/components/WalletModal',
  () => ({
    WalletModal: () => null,
  })
);

describe('ConnectWalletButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccount = null;
    mockIsConnected = false;
  });

  it('shows "Connect Wallet" when not connected', () => {
    render(<ConnectWalletButton />);

    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
  });

  it('calls establishConnection when clicking while disconnected', async () => {
    const user = userEvent.setup();
    render(<ConnectWalletButton />);

    await user.click(screen.getByRole('button', { name: 'Connect Wallet' }));

    expect(mockEstablishConnection).toHaveBeenCalledOnce();
  });

  it('shows truncated address when connected', () => {
    mockIsConnected = true;
    mockAccount = '0x1234567890abcdef1234567890abcdef12345678';

    render(<ConnectWalletButton />);

    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });

  it('renders avatar gradient when connected with address', () => {
    mockIsConnected = true;
    mockAccount = '0xabcdef1234567890';

    const { container } = render(<ConnectWalletButton />);

    const avatar = container.querySelector('span[style]');
    expect(avatar).not.toBeNull();
    expect(avatar!.getAttribute('style')).toContain('linear-gradient');
  });

  it('does not call establishConnection when connected and address exists', async () => {
    mockIsConnected = true;
    mockAccount = '0x1234567890abcdef1234567890abcdef12345678';
    const user = userEvent.setup();

    render(<ConnectWalletButton />);

    await user.click(screen.getByText('0x1234...5678'));

    expect(mockEstablishConnection).not.toHaveBeenCalled();
  });

  it('does not truncate short addresses', () => {
    mockIsConnected = true;
    mockAccount = '0x1234';

    render(<ConnectWalletButton />);

    expect(screen.getByText('0x1234')).toBeInTheDocument();
  });
});
