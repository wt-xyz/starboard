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
  error: Error | null;
  isOffline: boolean;
} => {
  const { chainTokenAssetId, usdcAssetId, usdcDecimals } = useTokenConfigs();
  const { rpcs } = useEndpointsConfig();
  const { address } = useAccounts();

  /**
   * TODO: Map-out balances to user open / closed positions
   * const { chainTokenAmount: nativeTokenCoinBalance, usdcAmount: usdcCoinBalance } = useAppSelector(
   *   BonsaiCore.account.balances.data
   * );
   */

  const stakingBalances = BonsaiHooks.useStakingDelegations().data?.balances;
  const nativeStakingCoinBalanace = stakingBalances?.[chainTokenAssetId];
  const nativeStakingBalance = MustBigNumber(nativeStakingCoinBalanace?.amount).toNumber();

  const {
    data: balances = [],
    status,
    isFetching,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ['fuel', 'ethBalance', address, rpcs, usdcAssetId, chainTokenAssetId],
    queryFn: async () => {
      if (!address) return [ZERO, ZERO];

      let lastError: Error | null = null;

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < rpcs.length; i++) {
        const rpcUrl = rpcs[i];
        if (!rpcUrl) continue;

        try {
          const provider = new Provider(rpcUrl);
          // eslint-disable-next-line no-await-in-loop -- Sequential RPC failover: try each endpoint one at a time
          return await Promise.all([
            provider.getBalance(address, chainTokenAssetId),
            provider.getBalance(address, usdcAssetId),
          ]);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`RPC ${rpcUrl} failed:`, lastError.message);
        }
      }

      throw lastError || new Error('All RPC endpoints failed to fetch balance');
    },
    enabled: Boolean(address),
    refetchInterval: 3500,
    staleTime: 2000,
    retry: false,
  });

  const [ethBalanceRaw = ZERO, usdcBalanceRaw = ZERO] = balances;

  const balance = formatUnits(ethBalanceRaw, 9);
  const usdcBalance = Number(formatUnits(usdcBalanceRaw, usdcDecimals));

  const isOffline =
    status === 'error' &&
    (queryError?.message?.toLowerCase().includes('fetch') ||
      queryError?.message?.toLowerCase().includes('network') ||
      queryError?.name === 'TypeError');

  return {
    balance,
    ethBalance: MustBigNumber(balance),
    nativeStakingBalance,
    usdcBalance,
    queryStatus: status,
    isQueryFetching: isFetching,
    refetchQuery: refetch,
    error: queryError as Error | null,
    isOffline,
  };
};
