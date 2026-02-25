import type { FC } from 'react';
import type { AssetId } from 'fuel-ts-sdk';
import type { AssetEntity } from 'fuel-ts-sdk/trading';
import * as $ from './AssetMarketStatsTable.css';
import { AssetRow } from './components/AssetRow';
import { TableHeader } from './components/TableHeader';

type AssetMarketStatsTableProps = {
  assets: AssetEntity[];
  watchedAssetId: AssetId | null;
  onSelect: (assetId: AssetId) => void;
};

export const AssetMarketStatsTable: FC<AssetMarketStatsTableProps> = ({
  assets,
  watchedAssetId,
  onSelect,
}) => (
  <div css={$.tableWrapper}>
    <table css={$.table}>
      <colgroup>
        <col css={$.colStar} />
        <col css={$.colMarket} />
        <col />
        <col />
        <col />
        <col />
        <col />
      </colgroup>
      <TableHeader />
      <tbody>
        {assets.map((asset) => (
          <AssetRow
            key={asset.assetId}
            asset={asset}
            isActive={watchedAssetId === asset.assetId}
            onSelect={onSelect}
          />
        ))}
      </tbody>
    </table>
  </div>
);
