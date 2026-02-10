import type { FetchLatestAccountTrackedAssetPricesWorkflowDependencies } from './fetchLatestAccountTrackedAssetPrices';
import { createFetchLatestAccountTrackedAssetPricesWorkflow } from './fetchLatestAccountTrackedAssetPrices';

export type TradingWorkflowsDependencies = FetchLatestAccountTrackedAssetPricesWorkflowDependencies;

export const createTradingWorkflows = (deps: TradingWorkflowsDependencies) => {
  return {
    fetchLatestAccountTrackedAssetPrices: createFetchLatestAccountTrackedAssetPricesWorkflow(deps),
  };
};

export type TradingWorkflows = ReturnType<typeof createTradingWorkflows>;
