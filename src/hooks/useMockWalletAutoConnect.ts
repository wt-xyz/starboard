import { useEffect } from 'react';

import { OnboardingState } from '@/constants/account';
import { LocalStorageKey } from '@/constants/localStorage';
import { ConnectorType, WalletNetworkType, WalletType } from '@/constants/wallets';

import { getOnboardingState } from '@/state/accountSelectors';
import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { setSourceAddress, setWalletInfo } from '@/state/wallet';
import { setOnboardingState } from '@/state/account';

/**
 * Auto-connects to a mock wallet if mock addresses are set in localStorage.
 * This enables development/testing with the mock indexer without requiring
 * a real wallet connection.
 *
 * Only activates if:
 * 1. dydx.DydxAddress is set in localStorage
 * 2. dydx.EvmAddress is set in localStorage
 * 3. Current onboarding state is Disconnected
 *
 * Mock addresses (from mock indexer):
 * - 0x1111111111111111111111111111111111111111
 * - 0x2222222222222222222222222222222222222222
 * - 0x3333333333333333333333333333333333333333
 * - 0x4444444444444444444444444444444444444444
 */
export const useMockWalletAutoConnect = () => {
  const dispatch = useAppDispatch();
  const onboardingState = useAppSelector(getOnboardingState);

  useEffect(() => {
    // Only auto-connect if currently disconnected
    if (onboardingState !== OnboardingState.Disconnected) {
      return;
    }

    // Check for mock wallet addresses in localStorage
    const dydxAddressRaw = localStorage.getItem(LocalStorageKey.DydxAddress);
    const evmAddressRaw = localStorage.getItem(LocalStorageKey.EvmAddress);

    if (!dydxAddressRaw || !evmAddressRaw) {
      return;
    }

    try {
      const dydxAddress = JSON.parse(dydxAddressRaw);
      const evmAddress = JSON.parse(evmAddressRaw);

      // Only auto-connect for known mock addresses (prevents accidental auto-connect with real addresses)
      const MOCK_ADDRESSES = [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
        '0x3333333333333333333333333333333333333333',
        '0x4444444444444444444444444444444444444444',
      ];

      const isMockAddress = MOCK_ADDRESSES.includes(evmAddress.toLowerCase());

      if (!isMockAddress) {
        // Not a mock address, don't auto-connect
        return;
      }

      console.log('🔧 [Mock Wallet] Auto-connecting to mock wallet:', evmAddress);

      // Set the selected wallet in localStorage (app checks this)
      localStorage.setItem(
        LocalStorageKey.OnboardingSelectedWallet,
        JSON.stringify({
          connectorType: ConnectorType.Test,
          name: WalletType.TestWallet,
        })
      );

      // Set wallet source account
      dispatch(
        setSourceAddress({
          address: evmAddress,
          chain: WalletNetworkType.Evm,
        })
      );

      // Set wallet info (using TestWallet type)
      dispatch(
        setWalletInfo({
          connectorType: ConnectorType.Test,
          name: WalletType.TestWallet,
        })
      );

      // Explicitly mark onboarding as connected to avoid relying on external effects
      dispatch(setOnboardingState(OnboardingState.AccountConnected));

      console.log('✅ [Mock Wallet] Wallet address set and onboarding marked connected');
      console.log('📊 [Mock Wallet] Address:', evmAddress);
      console.log('🔗 [Mock Wallet] Indexer should be running at http://localhost:4000');
      console.log('⏳ [Mock Wallet] App should auto-detect and connect...');
    } catch (error) {
      console.error('❌ [Mock Wallet] Failed to auto-connect:', error);
    }
  }, [onboardingState, dispatch]);
};
