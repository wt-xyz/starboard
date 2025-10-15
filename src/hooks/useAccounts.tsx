import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { BonsaiCore } from '@/bonsai/ontology';
import { useLogout, usePrivy } from '@privy-io/react-auth';
import { type Subaccount } from 'starboard-client-js';

import { OnboardingGuard, OnboardingState } from '@/constants/account';
import { LocalStorageKey } from '@/constants/localStorage';
import {
  ConnectorType,
  DydxAddress,
  PrivateInformation,
  WalletNetworkType,
  WalletType,
} from '@/constants/wallets';

import { setOnboardingGuard, setOnboardingState } from '@/state/account';
import { getGeo } from '@/state/accountSelectors';
import { useAppDispatch, useAppSelector } from '@/state/appTypes';
import { setSourceAddress, setWalletInfo } from '@/state/wallet';
import { getSourceAccount } from '@/state/walletSelectors';

import { isBlockedGeo } from '@/lib/compliance';

import { useDydxClient } from './useDydxClient';
import { useEnvFeatures } from './useEnvFeatures';
import { useFuelWallet } from './useFuelWallet';
import { useLocalStorage } from './useLocalStorage';

const AccountsContext = createContext<ReturnType<typeof useAccountsContext> | undefined>(undefined);

AccountsContext.displayName = 'Accounts';

export const AccountsProvider = ({ ...props }) => (
  <AccountsContext.Provider value={useAccountsContext()} {...props} />
);

export const useAccounts = () => useContext(AccountsContext)!;

const useAccountsContext = () => {
  const dispatch = useAppDispatch();
  const geo = useAppSelector(getGeo);
  const { checkForGeo } = useEnvFeatures();
  const { authenticated, ready, user } = usePrivy();
  const { logout: logoutPrivy } = useLogout();

  // Wallet connection
  const {
    fuel,
    isConnected: isConnectedFuel,
    address: fuelAddress,
    error: selectedWalletError,
    connect: selectWallet,
    disconnect: disconnectFuel,
  } = useFuelWallet();

  const isPrivyConnected = Boolean(authenticated && user);
  const connectedWalletAddress = ready && isPrivyConnected ? user?.wallet?.address : fuelAddress;
  const hasSubAccount = useAppSelector(BonsaiCore.account.parentSubaccountSummary.data) != null;
  const sourceAccount = useAppSelector(getSourceAccount);

  const isConnected = isConnectedFuel || isPrivyConnected;
  // Debug: Log current onboarding state
  const onboardingState = useAppSelector((state) => state.account.onboardingState);

  // Auto-set onboarding state to AccountConnected when Fuel wallet connects
  useEffect(() => {
    if (isConnected) {
      dispatch(setOnboardingState(OnboardingState.AccountConnected));
    } else {
      dispatch(setOnboardingState(OnboardingState.Disconnected));
    }
  }, [isConnected, connectedWalletAddress, onboardingState, dispatch]);

  const blockedGeo = useMemo(() => {
    return geo != null && isBlockedGeo(geo) && checkForGeo;
  }, [geo, checkForGeo]);

  // dYdXClient Onboarding & Account Helpers
  const { indexerClient, getWalletFromSignature } = useDydxClient();
  // dYdX subaccounts
  const [dydxSubaccounts, setDydxSubaccounts] = useState<Subaccount[] | undefined>();

  const getSubaccounts = async ({ dydxAddress }: { dydxAddress: DydxAddress }) => {
    try {
      const response = await indexerClient?.account.getSubaccounts(dydxAddress);
      setDydxSubaccounts(response?.subaccounts);
      return response?.subaccounts ?? [];
    } catch (error) {
      // 404 is expected if the user has no subaccounts
      // 403 is expected if the user account is blocked
      const status = error.status ?? error.response?.status;
      if (status === 404 || status === 403) {
        return [];
      }
      throw error;
    }
  };

  const [hdKey, setHdKey] = useState<PrivateInformation>();

  // Onboarding conditions
  const [hasAcknowledgedTerms, saveHasAcknowledgedTerms] = useLocalStorage({
    key: LocalStorageKey.OnboardingHasAcknowledgedTerms,
    defaultValue: false,
  });

  useEffect(() => {
    if (user?.wallet?.address && isConnected) {
      dispatch(
        setSourceAddress({
          address: user.wallet.address,
          chain: WalletNetworkType.Evm,
        })
      );

      dispatch(
        setWalletInfo({
          connectorType: ConnectorType.Privy,
          name: WalletType.Privy,
        })
      );
    }
  }, [user?.wallet?.address, isConnected]);

  useEffect(() => {
    dispatch(
      setOnboardingGuard({
        guard: OnboardingGuard.hasAcknowledgedTerms,
        value: hasAcknowledgedTerms,
      })
    );
  }, [dispatch, hasAcknowledgedTerms]);

  useEffect(() => {
    const hasPreviousTransactions = Boolean(dydxSubaccounts?.length);

    dispatch(
      setOnboardingGuard({
        guard: OnboardingGuard.hasPreviousTransactions,
        value: hasPreviousTransactions,
      })
    );
  }, [dispatch, dydxSubaccounts]);

  useEffect(() => {
    if (blockedGeo) {
      disconnect();
    }
  }, [blockedGeo]);

  const disconnect = async () => {
    // Disconnect local wallet
    disconnectFuel();

    // Logout from Privy if connected
    if (isPrivyConnected) {
      await logoutPrivy();
    }
  };

  return {
    // Wallet connection
    sourceAccount,

    // Wallet selection
    selectWallet,
    selectedWalletError,

    // Wallet connection (Fuel & Privy)
    fuel,
    isConnected,
    address: connectedWalletAddress,

    // dYdX accounts
    hdKey,

    // TODO: We'll replace with Connected Fuel Wallet
    dydxAddress: undefined as any as DydxAddress,

    // Onboarding state
    saveHasAcknowledgedTerms,

    // Disconnect wallet / accounts
    disconnect,

    // dydxClient Account methods
    getSubaccounts,
  };
};
