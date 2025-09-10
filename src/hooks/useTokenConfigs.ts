import { DydxChainId, TOKEN_CONFIG_MAP } from '@/constants/networks';
import { DydxChainAsset } from '@/constants/wallets';

import { getSelectedDydxChainId } from '@/state/appSelectors';
import { createAppSelector, useAppSelector } from '@/state/appTypes';

type TokenConfig = {
  denom: string;
  name: string;
  decimals: number;
  gasDenom?: string;
  image?: string;
};

type TokenConfigs = {
  [DydxChainAsset.USDC]: TokenConfig;
  [DydxChainAsset.CHAINTOKEN]: TokenConfig;
};

export type TokenConfigsResult = {
  tokensConfigs: TokenConfigs;
  usdcAssetId: string;
  usdcDecimals: number;
  usdcImage: string;
  usdcLabel: string;
  chainTokenDenom: string;
  chainTokenDecimals: number;
  chainTokenImage: string;
  chainTokenLabel: string;
  chainTokenAssetId: string;
};

const getTokenConfigsData = (selectedDydxChainId: DydxChainId): TokenConfigsResult => {
  const tokensConfigs = TOKEN_CONFIG_MAP[selectedDydxChainId];

  return {
    tokensConfigs,
    usdcAssetId: tokensConfigs[DydxChainAsset.USDC].assetId,
    chainTokenAssetId: tokensConfigs[DydxChainAsset.CHAINTOKEN].assetId,
    usdcDecimals: tokensConfigs[DydxChainAsset.USDC].decimals,
    usdcImage: tokensConfigs[DydxChainAsset.USDC].image,
    usdcLabel: tokensConfigs[DydxChainAsset.USDC].name,
    chainTokenDenom: tokensConfigs[DydxChainAsset.CHAINTOKEN].denom,
    chainTokenDecimals: tokensConfigs[DydxChainAsset.CHAINTOKEN].decimals,
    chainTokenImage: tokensConfigs[DydxChainAsset.CHAINTOKEN].image,
    chainTokenLabel: tokensConfigs[DydxChainAsset.CHAINTOKEN].name,
  };
};

export const selectTokenConfigs = createAppSelector(
  [getSelectedDydxChainId],
  (selectedDydxChainId): TokenConfigsResult => getTokenConfigsData(selectedDydxChainId)
);

export const useTokenConfigs = (): TokenConfigsResult => {
  return useAppSelector(selectTokenConfigs);
};
