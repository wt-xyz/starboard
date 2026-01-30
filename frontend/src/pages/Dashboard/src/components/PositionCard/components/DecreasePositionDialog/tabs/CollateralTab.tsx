import type { FC } from 'react';
import type { PositionStableId } from 'fuel-ts-sdk';
import * as styles from './CollateralTab.css';

export interface CollateralTabProps {
  positionId: PositionStableId;
  onSubmitSuccess?: () => void;
}

export const CollateralTab: FC<CollateralTabProps> = ({ positionId: _positionId }) => {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderText}>Collateral management coming soon</p>
    </div>
  );
};
