import { Address, Hex } from 'viem';

import { DepositStrategyId } from '../depositStrategies/DepositStrategy';

import { LoginResponse, createApiClient as createAuthClient } from './auth/__generated__/createApiClient';
import { UserNotFoundError } from './auth/errors';
import { APIStrategyDetailedInfo, createApiClient as createDMSClient } from './dms/__generated__/createApiClient';
import {
  ActiveStrategy as BEActiveStrategy,
  SKA as BESKA,
  chain_id as ChainId,
  UserOperation,
  createApiClient as createSKAClient,
} from './ska/__generated__/createApiClient';
import { SkaNotFoundError } from './ska/errors';

type SKAClient = ReturnType<typeof createSKAClient>;
type AuthClient = ReturnType<typeof createAuthClient>;
type DMSClient = ReturnType<typeof createDMSClient>;

// BE Schema doesn't doesn't ids enum, so we have to fix types here
export type ActiveStrategy = BEActiveStrategy & { strategyId: DepositStrategyId };

type SKA = { activeStrategies: ActiveStrategy[] } & BESKA;

interface SavingsBackendClientParams {
  skaClient: SKAClient;
  authClient: AuthClient;
  dmsClient: DMSClient;
}

interface CreateWalletSKAParams {
  userAddress: Address;
  activeStrategies: ActiveStrategy[];
  serializedSKA: string;
  chainId: ChainId;
}

export type SavingsAccountUserId = string;

// TODO: @merlin temp hardcoded structure
export interface APIPoint {
  imageUrl: string;
  name: string;
  multiplier: number;
}

export type DepositStrategyDetailedInfo = APIStrategyDetailedInfo & {
  points?: APIPoint[];
};

export interface PauseDepositingParams {
  pauseUntilDatetime?: Date | string;
}

export interface WallchainAuthMessage {
  info: string;
  expires: number;
}

interface AuthParams {
  signedMessage: Hex;
  message: WallchainAuthMessage;
}

interface GetSponsorshipInfoParams {
  chainId: ChainId;
  userOperation: UserOperation;
}

interface RunDepositingParams {
  chainId: ChainId;
}

interface GetDepositStrategyDetailedInfo {
  chainId: ChainId;
}

export type GetUserReturnType = ReturnType<AuthClient['getUser']>;

export class SavingsBackendClient {
  private skaClient: SKAClient;

  private authClient: AuthClient;

  private dmsClient: DMSClient;

  constructor({ skaClient, authClient, dmsClient }: SavingsBackendClientParams) {
    this.skaClient = skaClient;
    this.authClient = authClient;
    this.dmsClient = dmsClient;
  }

  async auth({ signedMessage, message }: AuthParams): Promise<LoginResponse> {
    const authData = {
      ...message,
      signature: signedMessage,
    };

    let authResponse;
    try {
      authResponse = await this.authClient.login(authData);
    } catch (error) {
      if (!(error instanceof UserNotFoundError)) {
        throw error;
      }
      authResponse = await this.authClient.register(authData);
    }

    return authResponse;
  }

  setAuthHeaders(token: string): void {
    this.skaClient.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    this.authClient.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    this.dmsClient.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  async pauseDepositing({ pauseUntilDatetime }: PauseDepositingParams) {
    return this.authClient.pauseDepositing(
      {
        pause_until: pauseUntilDatetime ? new Date(pauseUntilDatetime).toISOString() : null,
      },
      {
        params: {
          user_id: 'me',
        },
      },
    );
  }

  async getWalletSKA(userAddress: Address, chainId: ChainId) {
    // TODO: @merlin maybe we can use cache here
    try {
      return (await this.skaClient.getSKA({
        params: {
          aa_address: userAddress,
          chain_id: chainId,
        },
      })) as SKA;
    } catch (error) {
      if (error instanceof SkaNotFoundError) {
        return undefined;
      }
      throw error;
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

  async runDepositing({ chainId }: RunDepositingParams) {
    return this.dmsClient.runDepositing(undefined, {
      params: {
        chain_id: chainId,
      },
    });
  }

  async getUser() {
    return this.authClient.getUser({
      params: {
        user_id: 'me',
      },
    });
  }

  async getDepositStrategyDetailedInfo({
    chainId,
  }: GetDepositStrategyDetailedInfo): Promise<DepositStrategyDetailedInfo[]> {
    return this.dmsClient.getStrategiesDetails({
      params: {
        chain_id: chainId,
      },
    });
  }
}
