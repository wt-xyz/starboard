import { useConnectUI } from '@fuels/react';
import type { FC } from 'react';
import { Button } from '@/components/ui/Button';

interface ConnectWalletButtonProps {
  className?: string;
}

export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({ className }) => {
  const { connect, isConnecting } = useConnectUI();

  return (
    <Button
      variant="primary"
      size="small"
      onClick={() => connect()}
      disabled={isConnecting}
      className={className}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

