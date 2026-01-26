import { useState } from 'react';
import { Outlet } from 'react-router';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
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
import { useRequiredContext } from '@/lib/useRequiredContext';
import { WalletCollateralCard } from '../../components/WalletCollateralCard';
import * as styles from './DashboardLayout.css';
import { DashboardHeader } from './components/DashboardHeader';
import { MintButton } from './components/DashboardHeader/components/MintButton';

export function DashboardLayout() {
  const wallet = useRequiredContext(WalletContext);
  const isWalletConnected = wallet.isUserConnected();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function connectOrDisconnectWallet() {
    if (!wallet.isUserConnected()) await wallet.establishConnection();
    else wallet.disconnect();
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
              onClick={connectOrDisconnectWallet}
              css={isWalletConnected ? styles.walletConnected : styles.walletButton}
            >
              {isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}
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
                  <DashboardHeader />
                </div>

                <div css={styles.mobileMenuSection}>
                  {envs.isDev() && isWalletConnected && <MintButton />}
                  {isWalletConnected && <WalletCollateralCard />}

                  <SheetClose asChild>
                    <button
                      onClick={connectOrDisconnectWallet}
                      css={isWalletConnected ? styles.walletConnected : styles.walletButton}
                    >
                      {isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}
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
    </div>
  );
}
