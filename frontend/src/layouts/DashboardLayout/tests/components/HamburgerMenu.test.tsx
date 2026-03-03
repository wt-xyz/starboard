import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HamburgerMenu } from '../../src/views/DashboardLayout/components/DashboardHeader/components/HamburgerMenu';

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  SheetContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ConnectWalletButton', () => ({
  ConnectWalletButton: () => <button>Connect Wallet</button>,
}));

vi.mock(
  '../../src/views/DashboardLayout/components/DashboardHeader/components/NetworkSwitcher',
  () => ({
    NetworkSwitcher: () => <div>NetworkSwitcher</div>,
  })
);

vi.mock('@radix-ui/react-icons', () => ({
  HamburgerMenuIcon: () => <span>☰</span>,
}));

vi.mock('@/lib/componentize', () => ({
  componentize: (styles: Record<string, string>) => {
    const result: Record<string, (props: { children?: ReactNode }) => ReactNode> = {};
    for (const key of Object.keys(styles)) {
      result[key] = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
    }
    return result;
  },
}));

describe('HamburgerMenu', () => {
  it('renders menu trigger with accessible label', () => {
    render(<HamburgerMenu />);

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('renders ConnectWalletButton inside sheet content', () => {
    render(<HamburgerMenu />);

    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument();
  });

  it('renders NetworkSwitcher inside sheet content', () => {
    render(<HamburgerMenu />);

    expect(screen.getByText('NetworkSwitcher')).toBeInTheDocument();
  });
});
