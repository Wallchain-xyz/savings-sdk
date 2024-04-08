import { Address } from 'viem';

import { NetworkEnum, createApiClient } from './thecat/__generated__/createApiClient';

import type { DepositStrategyId } from '../depositStrategies/DepositStrategy';

type SessionKeyAccountServiceClient = ReturnType<typeof createApiClient>;
interface SavingsBackendClientParams {
  apiClient: SessionKeyAccountServiceClient;
  chainId: NetworkEnum;
}

interface UpdateWalletSessionKeyAccountParams {
  userAddress: Address;
  depositStrategyIds: DepositStrategyId[];
  serializedSessionKey: string;
  chainId: NetworkEnum;
}

export class SavingsBackendClient {
  private apiClient: SessionKeyAccountServiceClient;

  constructor({ apiClient }: SavingsBackendClientParams) {
    this.apiClient = apiClient;
  }

  async getWalletSessionKeyAccount(userAddress: Address, chainId: NetworkEnum) {
    // TODO: @merlin maybe we can use cache here
    try {
      return await this.apiClient.get('/b/v2/session_key_account_manager_service/session_key_account/:user_address', {
        queries: {
          chainId,
        },
        params: {
          user_address: userAddress,
        },
      });
    } catch (error) {
      // TODO: @merlin check that error is not found
      return undefined;
    }
  }

  async createWalletSessionKeyAccount(userAddress: Address, chainId: NetworkEnum) {
    return this.apiClient.post(
      '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
      undefined,
      {
        queries: {
          chainId,
        },
        params: {
          user_address: userAddress,
        },
      },
    );
  }

  async updateWalletSessionKeyAccount({
    userAddress,
    depositStrategyIds,
    serializedSessionKey,
    chainId,
  }: UpdateWalletSessionKeyAccountParams) {
    return this.apiClient.patch(
      '/b/v2/session_key_account_manager_service/session_key_account/:user_address/serialized_session_key',
      {
        serializedSessionKey,
        depositStrategyIds,
      },
      {
        queries: {
          chainId,
        },
        params: {
          user_address: userAddress,
        },
      },
    );
  }

  async deleteWalletSessionKeyAccount(userAddress: Address, chainId: NetworkEnum) {
    return this.apiClient.delete(
      '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
      undefined,
      {
        queries: {
          chainId,
        },
        params: {
          user_address: userAddress,
        },
      },
    );
  }
}
