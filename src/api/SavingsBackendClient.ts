import { Address } from 'viem';

import { createApiClient } from './createApiClient';

import type { DepositStrategyId } from '../depositStrategies/DepositStrategy';

type SessionKeyAccountServiceClient = ReturnType<typeof createApiClient>;
interface SavingsBackendClientParams {
  apiClient: SessionKeyAccountServiceClient;
}

interface UpdateWalletSessionKeyAccountParams {
  userAddress: Address;
  depositStrategyIds: DepositStrategyId[];
  serializedSessionKey: string;
}

export class SavingsBackendClient {
  private apiClient: SessionKeyAccountServiceClient;

  constructor({ apiClient }: SavingsBackendClientParams) {
    this.apiClient = apiClient;
  }

  async getWalletSessionKeyAccount(userAddress: Address) {
    // TODO: @merlin maybe we can use cache here
    try {
      return await this.apiClient.get('/b/v2/session_key_account_manager_service/session_key_account/:user_address', {
        params: {
          user_address: userAddress,
        },
      });
    } catch (error) {
      // TODO: @merlin check that error is not found
      return undefined;
    }
  }

  async createWalletSessionKeyAccount(userAddress: Address) {
    return this.apiClient.post(
      '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
      undefined,
      {
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
  }: UpdateWalletSessionKeyAccountParams) {
    return this.apiClient.patch(
      '/b/v2/session_key_account_manager_service/session_key_account/:user_address/serialized_session_key',
      {
        serializedSessionKey,
        depositStrategyIds,
      },
      {
        params: {
          user_address: userAddress,
        },
      },
    );
  }

  async deleteWalletSessionKeyAccount(userAddress: Address) {
    return this.apiClient.delete(
      '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
      undefined,
      {
        params: {
          user_address: userAddress,
        },
      },
    );
  }
}
