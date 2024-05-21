import { Address, Hex } from 'viem';

import { chain_id as ChainId, createApiClient as createAuthClient } from './auth/__generated__/createApiClient';
import { NonAAAddressError, getIsNonAAAddressError } from './auth/errors/NonAAAddressError';
import { getIsUserNotRegisteredError } from './auth/errors/UserNotRegisteredError';
import { ActiveStrategy, UserOperation, createApiClient as createSKAClient } from './ska/__generated__/createApiClient';

type SKAClient = ReturnType<typeof createSKAClient>;
type AuthClient = ReturnType<typeof createAuthClient>;

interface SavingsBackendClientParams {
  skaClient: SKAClient;
  authClient: AuthClient;
  chainId: ChainId;
}

interface CreateWalletSKAParams {
  userAddress: Address;
  activeStrategies: ActiveStrategy[];
  serializedSKA: string;
  chainId: ChainId;
}

export type SavingsAccountUserId = string;

export interface PauseDepositingParams {
  chainId: ChainId;
  pauseUntilDatetime?: Date | string;
}

export interface WallchainAuthMessage {
  info: string;
  aa_address: Address;
  expires: number;
}

interface AuthParams {
  chainId: ChainId;
  signedMessage: Hex;
  message: WallchainAuthMessage;
}

interface GetSponsorshipInfoParams {
  chainId: ChainId;
  userOperation: UserOperation;
}

export class SavingsBackendClient {
  private skaClient: SKAClient;

  private authClient: AuthClient;

  constructor({ skaClient, authClient }: SavingsBackendClientParams) {
    this.skaClient = skaClient;
    this.authClient = authClient;
  }

  async auth({ chainId, signedMessage, message }: AuthParams) {
    const authData = {
      ...message,
      signature: signedMessage,
    };
    const authParams = {
      params: {
        chain_id: chainId,
      },
    };

    let authResponse;
    try {
      authResponse = await this.authClient.login(authData, authParams);
    } catch (error) {
      if (getIsUserNotRegisteredError({ error })) {
        authResponse = await this.authClient.register(authData, authParams);
      } else {
        if (getIsNonAAAddressError({ error })) {
          throw new NonAAAddressError();
        }
        throw error;
      }
    }
    this.setAuthHeaders(authResponse.token);

    return authResponse;
  }

  private setAuthHeaders(token: string): void {
    this.skaClient.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    this.authClient.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  async pauseDepositing({ chainId, pauseUntilDatetime }: PauseDepositingParams) {
    return this.authClient.pauseDepositing(
      {
        pause_until: pauseUntilDatetime ? new Date(pauseUntilDatetime).toISOString() : null,
      },
      {
        params: {
          user_id: 'me',
          chain_id: chainId,
        },
      },
    );
  }

  async getWalletSKA(userAddress: Address, chainId: ChainId) {
    // TODO: @merlin maybe we can use cache here
    try {
      return await this.skaClient.getSKA({
        params: {
          aa_address: userAddress,
          chain_id: chainId,
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

  async createWalletSKA({ userAddress, activeStrategies, serializedSKA, chainId }: CreateWalletSKAParams) {
    return this.skaClient.createSKA(
      {
        serializedSka: serializedSKA,
        activeStrategies,
        aaAddress: userAddress,
      },
      {
        params: {
          chain_id: chainId,
        },
      },
    );
  }

  async deleteWalletSKA(userAddress: Address, chainId: ChainId) {
    return this.skaClient.deleteSKA(undefined, {
      params: {
        chain_id: chainId,
        aa_address: userAddress,
      },
    });
  }

  async getSponsorshipInfo({ chainId, userOperation }: GetSponsorshipInfoParams) {
    return this.skaClient.sponsorUserOperation(userOperation, {
      params: {
        chain_id: chainId,
        aa_address: userOperation.sender,
      },
    });
  }
}
