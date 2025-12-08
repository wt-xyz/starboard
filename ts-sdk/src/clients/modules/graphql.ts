import axios, { AxiosInstance, AxiosProxyConfig } from 'axios';

import { DEFAULT_API_TIMEOUT } from '../constants';

/**
 * @description Base GraphQL client for Squid-based indexers
 */
export default class GraphQLClient {
  readonly host: string;
  readonly apiTimeout: number;
  readonly axiosInstance: AxiosInstance;

  constructor(host: string, apiTimeout?: number | null, proxy?: AxiosProxyConfig) {
    // Ensure host ends with /graphql
    if (host.endsWith('/')) {
      this.host = `${host.slice(0, -1)}/graphql`;
    } else if (host.endsWith('/graphql')) {
      this.host = host;
    } else {
      this.host = `${host}/graphql`;
    }
    this.apiTimeout = apiTimeout || DEFAULT_API_TIMEOUT;
    this.axiosInstance = axios.create({
      proxy,
      timeout: this.apiTimeout,
    });
  }

  /**
   * Execute a GraphQL query
   * @param query - GraphQL query string
   * @param variables - Query variables
   * @returns Query response data
   */
  async query<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await this.axiosInstance.post(
      this.host,
      {
        query,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data;
  }
}

