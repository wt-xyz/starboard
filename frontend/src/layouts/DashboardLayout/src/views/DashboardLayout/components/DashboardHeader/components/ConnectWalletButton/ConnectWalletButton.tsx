import { type FC, useState } from 'react';
import { useAccount } from '@fuels/react';
import { WalletContext } from '@/contexts/WalletContext';
import { useAutoFaucet } from '@/lib/hooks/useAutoFaucet';
import { useRequiredContext } from '@/lib/useRequiredContext';
import * as $ from './ConnectWalletButton.css';
import { WalletModal } from './components/WalletModal';

export const ConnectWalletButton: FC = () => {
  const wallet = useRequiredContext(WalletContext);
  const { account } = useAccount();
  const isWalletConnected = wallet.isUserConnected();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const walletAddress = account ?? '';
  const displayAddress = walletAddress ? truncateAddress(walletAddress) : '';
  const avatarGradient = walletAddress ? getAddressGradient(walletAddress) : '';

  // Auto-faucet for burner wallets with 0 ETH
  useAutoFaucet(walletAddress);

  function handleWalletButtonClick() {
    if (isWalletConnected && walletAddress) {
      setIsWalletModalOpen(true);
    } else {
      wallet.establishConnection();
    }
  }

  return (
    <>
      <button
        onClick={handleWalletButtonClick}
        css={isWalletConnected ? $.walletConnected : $.walletButton}
      >
        {isWalletConnected && walletAddress ? (
          <>
            <span css={$.walletAvatar} style={{ background: avatarGradient }} />
            {displayAddress}
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>
      {walletAddress && (
        <WalletModal
          open={isWalletModalOpen}
          onOpenChange={setIsWalletModalOpen}
          address={walletAddress}
          avatarGradient={avatarGradient}
        />
      )}
    </>
  );
};

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getAddressGradient(address: string): string {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate two colors from the hash
  const color1 = `hsl(${Math.abs(hash % 360)}, 70%, 50%)`;
  const color2 = `hsl(${Math.abs((hash * 2) % 360)}, 70%, 60%)`;

  return `linear-gradient(135deg, ${color1}, ${color2})`;
}
