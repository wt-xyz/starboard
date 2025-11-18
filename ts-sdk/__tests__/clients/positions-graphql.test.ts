import axios from 'axios';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import PositionsGraphQLClient, {
    PositionData,
    PositionKeyData,
} from '../../src/clients/modules/positions-graphql';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as unknown as {
  create: Mock;
};

describe('PositionsGraphQLClient', () => {
  let client: PositionsGraphQLClient;
  const graphqlEndpoint = 'https://test-graphql-endpoint.com/graphql';

  const mockPositionKey: PositionKeyData = {
    id: '0xtest-account-0xbtc-true',
    account: '0xtest-account',
    indexAssetId: '0xbtc',
    isLong: true,
  };

  const mockPosition: PositionData = {
    id: 'position-1',
    positionKey: mockPositionKey,
    collateralAmout: '10000000000',
    size: '5000000',
    timestamp: 1699900000,
    latest: true,
    change: 'INCREASE',
    collateralTransferred: '1000000000',
    positionFee: '50000',
    fundingRate: '100000',
    pnlDelta: '500000',
    realizedFundingRate: '80000',
    realizedPnl: '1000000',
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Create axios instance mock
    const mockAxiosInstance = {
      post: vi.fn(),
    };
    
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
    
    client = new PositionsGraphQLClient(graphqlEndpoint);
  });

  describe('constructor', () => {
    it('should create instance with correct endpoint', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 10000,
      });
    });
  });

  describe('getPositions', () => {
    it('should fetch all positions without filters', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositions();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('query GetPositions'),
        })
      );

      expect(result).toEqual([mockPosition]);
    });

    it('should fetch positions with latestOnly filter', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositions({ latestOnly: true });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('latest_eq: true'),
        })
      );

      expect(result).toEqual([mockPosition]);
    });

    it('should fetch positions filtered by account', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositions({ account: '0xtest-account' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('account_eq: "0xtest-account"'),
        })
      );

      expect(result).toEqual([mockPosition]);
    });

    it('should fetch positions with limit', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositions({ limit: 10 });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('limit: 10'),
        })
      );

      expect(result).toEqual([mockPosition]);
    });

    it('should fetch positions with orderBy', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositions({ orderBy: 'timestamp_DESC' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('orderBy: timestamp_DESC'),
        })
      );

      expect(result).toEqual([mockPosition]);
    });

    it('should fetch positions with multiple filters', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositions({
        latestOnly: true,
        account: '0xtest-account',
        limit: 20,
        orderBy: 'timestamp_DESC',
      });

      const postCall = (mockAxiosInstance.post as Mock).mock.calls[0];
      const query = postCall[1].query;

      expect(query).toContain('latest_eq: true');
      expect(query).toContain('account_eq: "0xtest-account"');
      expect(query).toContain('limit: 20');
      expect(query).toContain('orderBy: timestamp_DESC');

      expect(result).toEqual([mockPosition]);
    });

    it('should return empty array when no positions found', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositions();

      expect(result).toEqual([]);
    });
  });

  describe('getPositionKeys', () => {
    it('should fetch all position keys without filters', async () => {
      const mockResponse = {
        data: {
          data: {
            positionKeys: [mockPositionKey],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionKeys();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('query GetPositionKeys'),
        })
      );

      expect(result).toEqual([mockPositionKey]);
    });

    it('should fetch position keys filtered by account', async () => {
      const mockResponse = {
        data: {
          data: {
            positionKeys: [mockPositionKey],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionKeys({ account: '0xtest-account' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('account_eq: "0xtest-account"'),
        })
      );

      expect(result).toEqual([mockPositionKey]);
    });

    it('should fetch position keys filtered by indexAssetId', async () => {
      const mockResponse = {
        data: {
          data: {
            positionKeys: [mockPositionKey],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionKeys({ indexAssetId: '0xbtc' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('indexAssetId_eq: "0xbtc"'),
        })
      );

      expect(result).toEqual([mockPositionKey]);
    });

    it('should fetch position keys filtered by isLong (true)', async () => {
      const mockResponse = {
        data: {
          data: {
            positionKeys: [mockPositionKey],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionKeys({ isLong: true });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('isLong_eq: true'),
        })
      );

      expect(result).toEqual([mockPositionKey]);
    });

    it('should fetch position keys filtered by isLong (false)', async () => {
      const mockResponse = {
        data: {
          data: {
            positionKeys: [mockPositionKey],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionKeys({ isLong: false });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        graphqlEndpoint,
        expect.objectContaining({
          query: expect.stringContaining('isLong_eq: false'),
        })
      );

      expect(result).toEqual([mockPositionKey]);
    });

    it('should fetch position keys with multiple filters', async () => {
      const mockResponse = {
        data: {
          data: {
            positionKeys: [mockPositionKey],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionKeys({
        account: '0xtest-account',
        indexAssetId: '0xbtc',
        isLong: true,
      });

      const postCall = (mockAxiosInstance.post as Mock).mock.calls[0];
      const query = postCall[1].query;

      expect(query).toContain('account_eq: "0xtest-account"');
      expect(query).toContain('indexAssetId_eq: "0xbtc"');
      expect(query).toContain('isLong_eq: true');

      expect(result).toEqual([mockPositionKey]);
    });

    it('should return empty array when no position keys found', async () => {
      const mockResponse = {
        data: {
          data: {
            positionKeys: [],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionKeys();

      expect(result).toEqual([]);
    });
  });

  describe('getLatestPositionsByAccount', () => {
    it('should fetch latest positions for an account', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getLatestPositionsByAccount('0xtest-account');

      const postCall = (mockAxiosInstance.post as Mock).mock.calls[0];
      const query = postCall[1].query;

      expect(query).toContain('latest_eq: true');
      expect(query).toContain('account_eq: "0xtest-account"');
      expect(query).toContain('orderBy: timestamp_DESC');

      expect(result).toEqual([mockPosition]);
    });

    it('should return empty array when account has no positions', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getLatestPositionsByAccount('0xempty-account');

      expect(result).toEqual([]);
    });
  });

  describe('getPositionHistory', () => {
    it('should fetch position history for an account without asset filter', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionHistory('0xtest-account');

      const postCall = (mockAxiosInstance.post as Mock).mock.calls[0];
      const query = postCall[1].query;

      expect(query).toContain('account_eq: "0xtest-account"');
      expect(query).toContain('orderBy: timestamp_DESC');
      expect(query).toContain('limit: 50');

      expect(result).toEqual([mockPosition]);
    });

    it('should fetch position history for an account with asset filter', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionHistory('0xtest-account', '0xbtc');

      const postCall = (mockAxiosInstance.post as Mock).mock.calls[0];
      const query = postCall[1].query;

      expect(query).toContain('account_eq: "0xtest-account"');
      expect(query).toContain('indexAssetId_eq: "0xbtc"');
      expect(query).toContain('orderBy: timestamp_DESC');
      expect(query).toContain('limit: 50');

      expect(result).toEqual([mockPosition]);
    });

    it('should fetch position history with custom limit', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [mockPosition],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionHistory('0xtest-account', undefined, 100);

      const postCall = (mockAxiosInstance.post as Mock).mock.calls[0];
      const query = postCall[1].query;

      expect(query).toContain('limit: 100');

      expect(result).toEqual([mockPosition]);
    });

    it('should return empty array when no history found', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      const result = await client.getPositionHistory('0xempty-account');

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should throw error when GraphQL request fails', async () => {
      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(client.getPositions()).rejects.toThrow('Network error');
    });

    it('should throw error when GraphQL returns invalid response', async () => {
      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue({
        data: null,
      });

      await expect(client.getPositions()).rejects.toThrow();
    });
  });

  describe('GraphQL query structure', () => {
    it('should include all required position fields in query', async () => {
      const mockResponse = {
        data: {
          data: {
            positions: [],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      await client.getPositions();

      const postCall = (mockAxiosInstance.post as Mock).mock.calls[0];
      const query = postCall[1].query;

      // Check that all required fields are present
      expect(query).toContain('id');
      expect(query).toContain('positionKey');
      expect(query).toContain('collateralAmout');
      expect(query).toContain('size');
      expect(query).toContain('timestamp');
      expect(query).toContain('latest');
      expect(query).toContain('change');
      expect(query).toContain('collateralTransferred');
      expect(query).toContain('positionFee');
      expect(query).toContain('fundingRate');
      expect(query).toContain('pnlDelta');
      expect(query).toContain('realizedFundingRate');
      expect(query).toContain('realizedPnl');
    });

    it('should include all required positionKey fields in query', async () => {
      const mockResponse = {
        data: {
          data: {
            positionKeys: [],
          },
        },
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as Mock).mockResolvedValue(mockResponse);

      await client.getPositionKeys();

      const postCall = (mockAxiosInstance.post as Mock).mock.calls[0];
      const query = postCall[1].query;

      // Check that all required fields are present
      expect(query).toContain('id');
      expect(query).toContain('account');
      expect(query).toContain('indexAssetId');
      expect(query).toContain('isLong');
    });
  });
});

