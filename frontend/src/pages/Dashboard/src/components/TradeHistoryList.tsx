import { useSdkQuery, useTradingSdk } from '@/lib/fuel-ts-sdk';
import { usePolling } from '@/lib/usePolling';
import type { PositionEntity } from 'fuel-ts-sdk/trading';
import { useCallback, useMemo, type FC } from 'react';
import { TradeHistoryCard } from './TradeHistoryCard';
import * as styles from './TradeHistoryList.css';

export const TradeHistoryList: FC = () => {
  const trading = useTradingSdk();
  const userAddress = useSdkQuery((sdk) => sdk.accounts.getCurrentUserAddress());

  // Fetch all positions (not just latest) to get trade history
  usePolling(
    useCallback(() => {
      if (userAddress) trading.fetchPositionsByAccount(userAddress, false);
    }, [trading, userAddress]),
    5000 // Poll every 5 seconds (less frequent than open positions)
  );

  // Get all positions for the user
  const allPositions = useSdkQuery((sdk) => {
    if (!userAddress) return [];
    const state = sdk.store.getState();
    const positions = state.trading.positions.positions;
    return positions.ids
      .map((id) => positions.entities[id as keyof typeof positions.entities])
      .filter((p): p is PositionEntity => !!p && p.accountAddress === userAddress);
  });

  // Filter for closed positions (latest revision with size = 0)
  const closedPositions = useMemo(() => {
    // Group by stableId and get the latest for each
    const latestByStableId = new Map<string, PositionEntity>();
    allPositions.forEach((position) => {
      if (!position) return;
      const existing = latestByStableId.get(position.stableId);
      if (!existing || position.timestamp > existing.timestamp) {
        latestByStableId.set(position.stableId, position);
      }
    });

    // Filter for closed positions (size = 0)
    return Array.from(latestByStableId.values())
      .filter((p: PositionEntity) => p.size.value === '0')
      .sort((a: PositionEntity, b: PositionEntity) => b.timestamp - a.timestamp); // Most recent first
  }, [allPositions]);

  if (closedPositions.length === 0) {
    return (
      <div css={styles.emptyState}>
        <span css={styles.emptyStateText}>No trade history yet</span>
      </div>
    );
  }

  return (
    <div css={styles.container}>
      {closedPositions.map((position) => (
        <TradeHistoryCard key={position.revisionId} position={position} />
      ))}
    </div>
  );
};
