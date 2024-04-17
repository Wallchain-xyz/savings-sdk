import { Address, Hex } from 'viem';

import { WallchainAuthMessage } from '../SavingsAccount/createAuthMessage';

import { chain_id as ChainId, createApiClient as createAuthClient } from './auth/__generated__/createApiClient';
import { createApiClient as createSKAClient } from './ska/__generated__/createApiClient';

import type { DepositStrategyId } from '../depositStrategies/DepositStrategy';

type SKAClient = ReturnType<typeof createSKAClient>;
type AuthClient = ReturnType<typeof createAuthClient>;

interface SavingsBackendClientParams {
  skaClient: SKAClient;
  authClient: AuthClient;
  chainId: ChainId;
}

interface CreateWalletSKAParams {
  userAddress: Address;
  depositStrategyIds: DepositStrategyId[];
  serializedSKA: string;
  chainId: ChainId;
}

interface AuthParams {
  chainId: ChainId;
  signedMessage: Hex;
  message: WallchainAuthMessage;
}

export class SavingsBackendClient {
  private skaClient: SKAClient;

  private authClient: AuthClient;

  constructor({ skaClient, authClient }: SavingsBackendClientParams) {
    this.skaClient = skaClient;
    this.authClient = authClient;
  }

  async auth({ chainId, signedMessage, message }: AuthParams) {
    const { token } = await this.authClient.login(
      {
        ...message,
        signature: signedMessage,
      },
      {
        params: {
          chain_id: chainId,
        },
      },
    );
    this.skaClient.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    this.authClient.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  async getWalletSKA(userAddress: Address, chainId: ChainId) {
    // TODO: @merlin maybe we can use cache here
    try {
      return await this.skaClient.getSKA({
        params: {
          chain_id: chainId,
          user_address: userAddress,
        },
      });
    } catch (error) {
      // TODO: @merlin check that error is not found
      return undefined;
    }
  }

  async getSKAPublicKey(chainId: ChainId) {
    return this.skaClient.getSKAAddress({
      params: {
        chain_id: chainId,
      },
    });
  }

  async createWalletSKA({ userAddress, depositStrategyIds, serializedSKA, chainId }: CreateWalletSKAParams) {
    return this.skaClient.createSKA(
      {
        serializedSka: serializedSKA,
        depositStrategyIds,
      },
      {
        params: {
          chain_id: chainId,
          user_address: userAddress,
        },
      },
    );
  }

  async deleteWalletSKA(userAddress: Address, chainId: ChainId) {
    return this.skaClient.deleteSKA(undefined, {
      params: {
        chain_id: chainId,
        user_address: userAddress,
      },
    });
  }
}
