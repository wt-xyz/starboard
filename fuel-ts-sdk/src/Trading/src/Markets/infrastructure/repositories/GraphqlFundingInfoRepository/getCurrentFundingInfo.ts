import type { AssetId } from '@sdk/shared/types';
import type { GraphQLClient } from 'graphql-request';
import { type FundingInfoEntity, FundingInfoEntitySchema } from '../../../domain';
import { GET_CURRENT_FUNDING_INFO_QUERY } from './getCurrentFundingInfo.gql';

export interface GetCurrentFundingInfoActionDependencies {
  graphqlClient: GraphQLClient;
}

export const createGetCurrentFundingInfoAction =
  (deps: GetCurrentFundingInfoActionDependencies) =>
  async (assetId: AssetId): Promise<FundingInfoEntity | undefined> => {
    const data = await deps.graphqlClient.request<{
      currentFundingInfos: { nodes: Record<string, unknown>[] };
    }>(GET_CURRENT_FUNDING_INFO_QUERY, { asset: assetId });

    const dto = data.currentFundingInfos.nodes.at(0);
    if (!dto) return;

    return FundingInfoEntitySchema.parse({
      assetId: dto.asset,
      totalShortSizes: dto.totalShortSizes,
      totalLongSizes: dto.totalLongSizes,
      longCumulativeFundingRate: dto.longCumulativeFundingRate,
      shortCumulativeFundingRate: dto.shortCumulativeFundingRate,
    });
  };
