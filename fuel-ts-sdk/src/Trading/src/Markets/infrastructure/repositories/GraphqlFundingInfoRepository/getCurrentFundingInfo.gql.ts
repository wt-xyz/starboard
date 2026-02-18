import { gql } from 'graphql-request';

export const GET_CURRENT_FUNDING_INFO_QUERY = gql`
  query GetCurrentFundingInfo($asset: String) {
    currentFundingInfos(first: 1, condition: { asset: $asset }) {
      nodes {
        asset
        totalShortSizes
        totalLongSizes
        longCumulativeFundingRate
        shortCumulativeFundingRate
      }
    }
  }
`;
