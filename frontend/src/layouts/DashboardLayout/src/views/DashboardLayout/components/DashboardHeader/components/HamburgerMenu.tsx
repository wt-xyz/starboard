import { type FC, useState } from 'react';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { ConnectWalletButton } from '@/components/ConnectWalletButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { componentize } from '@/lib/componentize';
import * as $ from './HamburgerMenu.css';
import { NetworkSwitcher } from './NetworkSwitcher';

export const HamburgerMenu: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <button css={$.mobileMenuButton} type="button" aria-label="Open menu">
          <HamburgerMenuIcon />
        </button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <$$.mobileMenuContent>
          <$$.mobileMenuSection>
            <NetworkSwitcher />
          </$$.mobileMenuSection>

          <$$.mobileMenuSection>
            <ConnectWalletButton />
          </$$.mobileMenuSection>
        </$$.mobileMenuContent>
      </SheetContent>
    </Sheet>
  );
};

const $$ = componentize($);
