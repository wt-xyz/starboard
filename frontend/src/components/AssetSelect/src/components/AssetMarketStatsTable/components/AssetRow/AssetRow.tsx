import { type FC, memo } from 'react';
import type { AssetId } from 'fuel-ts-sdk';
import type { AssetEntity } from 'fuel-ts-sdk/trading';
import * as $ from './AssetRow.css';
import { AvailableLiqCell } from './components/AvailableLiqCell';
import { Change24hCell } from './components/Change24hCell';
import { LastPriceCell } from './components/LastPriceCell';
import { MarketCell } from './components/MarketCell';
import { OpenInterestCell } from './components/OpenInterestCell';
import { StarCell } from './components/StarCell';
import { VolumeCell } from './components/VolumeCell';

type AssetRowProps = {
  asset: AssetEntity;
  isActive: boolean;
  onSelect: (assetId: AssetId) => void;
};

export const AssetRow: FC<AssetRowProps> = memo(({ asset, isActive, onSelect }) => (
  <tr css={[$.row, isActive && $.rowActive]} onClick={() => onSelect(asset.assetId)}>
    <StarCell />
    <MarketCell symbol={asset.symbol} />
    <LastPriceCell assetId={asset.assetId} />
    <Change24hCell assetId={asset.assetId} />
    <VolumeCell assetId={asset.assetId} />
    <OpenInterestCell assetId={asset.assetId} />
    <AvailableLiqCell />
  </tr>
));
AssetRow.displayName = 'AssetRow';
