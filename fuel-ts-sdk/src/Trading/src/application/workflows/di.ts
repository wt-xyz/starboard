import type { SyncAccountTrackedAssetPricesWorkflowDependencies } from './syncAccountTrackedAssetPrices';
import { createSyncAccountTrackedAssetPricesWorkflow } from './syncAccountTrackedAssetPrices';

export type TradingWorkflowsDependencies = SyncAccountTrackedAssetPricesWorkflowDependencies;

export const createTradingWorkflows = (deps: TradingWorkflowsDependencies) => {
  return {
    syncAccountTrackedAssetPrices: createSyncAccountTrackedAssetPricesWorkflow(deps),
  };
};

export type TradingWorkflows = ReturnType<typeof createTradingWorkflows>;
