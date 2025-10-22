import { useMemo } from 'react';

import { BonsaiHooks } from '@/bonsai/ontology';
import { QueryObserverResult, RefetchOptions, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { BN, formatUnits, Provider } from 'fuels';

import { MustBigNumber } from '@/lib/numbers';

import { useAccounts } from './useAccounts';
import { useEndpointsConfig } from './useEndpointsConfig';
import { useTokenConfigs } from './useTokenConfigs';

const ZERO = new BN(0);
export const useAccountBalance = (): {
  balance: string | undefined;
  isQueryFetching: boolean;
  nativeStakingBalance: number;
  ethBalance: BigNumber;
  queryStatus: 'success' | 'error' | 'pending';
  usdcBalance: number;
  refetchQuery: (options?: RefetchOptions) => Promise<QueryObserverResult>;
} => {
  const { chainTokenAssetId, usdcAssetId, usdcDecimals } = useTokenConfigs();
  const { defaultRpc } = useEndpointsConfig();
  const { address } = useAccounts();

  /**
 * TODO: Map-out balances to user open / closed positions
 * const { chainTokenAmount: nativeTokenCoinBalance, usdcAmount: usdcCoinBalance } = useAppSelector(
    BonsaiCore.account.balances.data
  );
 */

  const stakingBalances = BonsaiHooks.useStakingDelegations().data?.balances;
  const nativeStakingCoinBalanace = stakingBalances?.[chainTokenAssetId];
  const nativeStakingBalance = MustBigNumber(nativeStakingCoinBalanace?.amount).toNumber();

  // Fuel ETH balance fetching
  const fuelProvider = useMemo(() => new Provider(defaultRpc), [defaultRpc]);

  const {
    data: balances = [],
    status,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['fuel', 'ethBalance', address, defaultRpc, usdcAssetId, chainTokenAssetId],
    queryFn: async () => {
      if (!address) return [ZERO, ZERO];
      return Promise.all([
        fuelProvider.getBalance(address, chainTokenAssetId),
        fuelProvider.getBalance(address, usdcAssetId),
      ]);
    },
    enabled: Boolean(address),
    refetchInterval: 3500,
    staleTime: 2000,
  });

  const [ethBalanceRaw = ZERO, usdcBalanceRaw = ZERO] = balances;

  const balance = formatUnits(ethBalanceRaw, 9);
  const usdcBalance = Number(formatUnits(usdcBalanceRaw, usdcDecimals));

  return {
    balance,
    ethBalance: MustBigNumber(balance),
    nativeStakingBalance,
    usdcBalance,
    queryStatus: status,
    isQueryFetching: isFetching,
    refetchQuery: refetch,
  };
};
