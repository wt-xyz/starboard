import type { FundingInfoRepository } from '../../../domain';
import type { GetCurrentFundingInfoActionDependencies } from './getCurrentFundingInfo';
import { createGetCurrentFundingInfoAction } from './getCurrentFundingInfo';

export type GraphqlFundingInfoRepositoryDependencies = GetCurrentFundingInfoActionDependencies;

export const createGraphqlFundingInfoRepository = (
  deps: GraphqlFundingInfoRepositoryDependencies
): FundingInfoRepository => ({
  getCurrentFundingInfo: createGetCurrentFundingInfoAction(deps),
});
