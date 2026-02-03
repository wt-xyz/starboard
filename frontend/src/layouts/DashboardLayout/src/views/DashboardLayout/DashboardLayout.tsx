import logoStarboard from '@/assets/logo-starboard.png';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { WalletContext } from '@/contexts/WalletContext/WalletContext';
import { envs } from '@/lib/env';
import { useAutoFaucet } from '@/lib/hooks/useAutoFaucet';
import { useRequiredContext } from '@/lib/useRequiredContext';
import { useAccount } from '@fuels/react';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Outlet } from 'react-router';
import { WalletCollateralCard } from '../../components/WalletCollateralCard';
import { WalletModal } from '../../components/WalletModal';
import * as styles from './DashboardLayout.css';
import { DashboardHeader } from './components/DashboardHeader';
import { MintButton } from './components/DashboardHeader/components/MintButton';

/**
 * Truncates an address to show first 6 and last 4 characters
 */
function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Generates a gradient background based on the address
 */
function getAddressGradient(address: string): string {
  // Create a simple hash from the address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate two colors from the hash
  const color1 = `hsl(${Math.abs(hash % 360)}, 70%, 50%)`;
  const color2 = `hsl(${Math.abs((hash * 2) % 360)}, 70%, 60%)`;

  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

export function DashboardLayout() {
  const wallet = useRequiredContext(WalletContext);
  const { account } = useAccount();
  const isWalletConnected = wallet.isUserConnected();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <div css={styles.page}>
      <header css={styles.header}>
        <div css={styles.headerLeft}>
          <img src={logoStarboard} alt="Starboard" css={styles.logo} />

          <div css={styles.desktopOnly}>
            <DashboardHeader />
          </div>
        </div>

        <div css={styles.headerRight}>
          <div css={styles.desktopOnly}>
            {envs.isDev() && isWalletConnected && <MintButton />}
            {isWalletConnected && <WalletCollateralCard />}
            <button
              onClick={handleWalletButtonClick}
              css={isWalletConnected ? styles.walletConnected : styles.walletButton}
            >
              {isWalletConnected && walletAddress ? (
                <>
                  <span css={styles.walletAvatar} style={{ background: avatarGradient }} />
                  {displayAddress}
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button css={styles.mobileMenuButton} type="button" aria-label="Open menu">
                <HamburgerMenuIcon />
              </button>
            </SheetTrigger>

            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <div css={styles.mobileMenuContent}>
                <div css={styles.mobileMenuSection}>
                  {envs.isDev() && isWalletConnected && <MintButton />}
                  {isWalletConnected && <WalletCollateralCard />}

                  <SheetClose asChild>
                    <button
                      onClick={handleWalletButtonClick}
                      css={isWalletConnected ? styles.walletConnected : styles.walletButton}
                    >
                      {isWalletConnected && walletAddress ? (
                        <>
                          <span css={styles.walletAvatar} style={{ background: avatarGradient }} />
                          {displayAddress}
                        </>
                      ) : (
                        'Connect Wallet'
                      )}
                    </button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main css={styles.container}>
        <Outlet />
      </main>

      {walletAddress && (
        <WalletModal
          open={isWalletModalOpen}
          onOpenChange={setIsWalletModalOpen}
          address={walletAddress}
          avatarGradient={avatarGradient}
        />
      )}
    </div>
  );
}
