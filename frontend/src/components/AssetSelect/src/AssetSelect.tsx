import { type FC, useCallback } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { AssetId } from 'fuel-ts-sdk';
import { componentize } from '@/lib/componentize';
import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { scrollFadeX } from '@/styles/scrollFade.css';
import * as $ from './AssetSelect.css';
import { ASSET_ICONS, formatSymbol } from './AssetSelect.utils';
import { AssetMarketStatsTable } from './components/AssetMarketStatsTable';

export const AssetSelect: FC<{
  id?: string;
  fullWidth?: boolean;
}> = ({ id = POPOVER_ID, fullWidth = false }) => {
  const sdk = useTradingSdk();
  const allAssets = useSdkQuery((s) => s.trading.getAllAssets()).filter((a) => !a.isBaseAsset);
  const watchedAsset = useSdkQuery(sdk.getWatchedAsset);

  const handleSelect = useCallback(
    (assetId: AssetId) => {
      sdk.watchAsset(assetId);
      document.getElementById(id)?.hidePopover();
    },
    [sdk, id]
  );

  return (
    <>
      <button popoverTarget={id} css={$.trigger}>
        {watchedAsset && ASSET_ICONS[watchedAsset.symbol] && (
          <img src={ASSET_ICONS[watchedAsset.symbol]} alt="" css={$.assetIcon} />
        )}
        {watchedAsset ? formatSymbol(watchedAsset.symbol) : 'Select Market'}
        <ChevronDownIcon css={$.triggerChevron} />
      </button>

      <div popover="auto" id={id} css={$.rootStyle({ fullWidth })}>
        <$$.popoverScroller css={scrollFadeX}>
          <div css={$.popoverContent({ fullWidth })}>
            <AssetMarketStatsTable
              assets={allAssets}
              watchedAssetId={watchedAsset?.assetId ?? null}
              onSelect={handleSelect}
            />
          </div>
        </$$.popoverScroller>
      </div>
    </>
  );
};

const POPOVER_ID = 'asset-select-popover';

const $$ = componentize($);
