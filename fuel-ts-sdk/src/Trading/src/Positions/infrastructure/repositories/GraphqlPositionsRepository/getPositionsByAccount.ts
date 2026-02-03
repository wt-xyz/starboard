import type { Address } from '@sdk/shared/types';
import type { GraphQLClient } from 'graphql-request';
import type { PositionEntity } from '../../../domain';
import {
  GET_POSITIONS_BY_ACCOUNT_QUERY,
  POSITION_KEYS_LIMIT,
  POSITIONS_PER_KEY_LIMIT,
} from './getPositionsByAccount.gql';
import { toDomainPosition, type PositionKeyResponse } from './mappers';

export const createGetPositionsByAccountAction =
  (client: GraphQLClient) =>
    async (account?: Address, _latestOnly?: boolean): Promise<PositionEntity[]> => {
      const data = await client.request<{
        positionKeys: { nodes: PositionKeyResponse[] };
      }>(GET_POSITIONS_BY_ACCOUNT_QUERY, {
        account,
        firstKeys: POSITION_KEYS_LIMIT,
        firstPositions: POSITIONS_PER_KEY_LIMIT,
      });

      return data.positionKeys.nodes.flatMap((positionKey) =>
        positionKey.positions.nodes.map((position) => toDomainPosition(position, positionKey))
      );
    };
