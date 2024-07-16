import { Address, PrivateKeyAccount } from 'viem';

import { UserOpResult } from '../AAProviders/shared/AAAccount';
import { SupportedChainId } from '../AAProviders/shared/chains';
import { PrimaryAAAccount } from '../AAProviders/shared/PrimaryAAAccount';
import {
  GetUserReturnType,
  PauseDepositingParams,
  SavingsBackendClient,
  WallchainAuthMessage,
} from '../api/SavingsBackendClient';

import { ActiveStrategy } from '../api/ska/__generated__/createApiClient';

import { DepositStrategy, DepositStrategyId, WithdrawStatus } from '../depositStrategies/DepositStrategy';
import { InstantWithdrawStrategyId, MultistepWithdrawStrategyId } from '../depositStrategies/strategies';
import { StrategiesFilter, StrategiesManager } from '../depositStrategies/StrategiesManager';

type SavingsAccountSigner = Pick<PrivateKeyAccount, 'address' | 'signTypedData'>;

export interface SavingsAccountParams {
  aaAccount: PrimaryAAAccount;
  privateKeyAccount: SavingsAccountSigner;
  savingsBackendClient: SavingsBackendClient;
  strategiesManager: StrategiesManager;
  chainId: SupportedChainId;
}

interface WithdrawOrDepositParams {
  depositStrategyId: DepositStrategyId;
  amount: bigint;
}

interface InstantWithdrawParams
  extends Omit<WithdrawOrDepositParams, 'amount'>,
    Omit<PauseDepositingParams, 'chainId'> {
  depositStrategyId: InstantWithdrawStrategyId;
  amount?: bigint;
}

interface MultistepWithdrawParams
  extends Omit<WithdrawOrDepositParams, 'amount'>,
    Omit<PauseDepositingParams, 'chainId'> {
  depositStrategyId: MultistepWithdrawStrategyId;
  amount?: bigint;
}

interface ActivateStrategiesParams {
  activeStrategies: (ActiveStrategy & { strategyId: DepositStrategyId })[];
  skipRevokeOnChain?: boolean;
}

export class SavingsAccount {
  private savingsBackendClient: SavingsBackendClient;

  private privateKeyAccount: SavingsAccountSigner;

  chainId: SupportedChainId;

  primaryAAAccount: PrimaryAAAccount;

  strategiesManager: StrategiesManager;

  constructor({
    aaAccount,
    privateKeyAccount,
    savingsBackendClient,
    strategiesManager,
    chainId,
  }: SavingsAccountParams) {
    this.savingsBackendClient = savingsBackendClient;
    this.strategiesManager = strategiesManager;
    this.chainId = chainId;
    this.primaryAAAccount = aaAccount;
    this.privateKeyAccount = privateKeyAccount;
  }

  get aaAddress(): Address {
    return this.primaryAAAccount.aaAddress;
  }

  async activateStrategies({ activeStrategies, skipRevokeOnChain }: ActivateStrategiesParams): Promise<void> {
    await this.deactivateAllStrategies(skipRevokeOnChain);

    const { serializedSKAData, txnsToActivate } = await this.primaryAAAccount.createSessionKey({
      skaAddress: await this.savingsBackendClient.getSKAPublicKey(this.chainId),
      permissions: activeStrategies.flatMap(activeStrategy => {
        const strategy = this.strategiesManager.getStrategy(activeStrategy.strategyId);
        return strategy.getPermissions({
          ...activeStrategy.paramValuesByKey,
          aaAddress: this.aaAddress,
        });
      }),
    });

    if (txnsToActivate.length > 0) {
      await this.primaryAAAccount.sendTxnsAndWait(txnsToActivate);
    }

    await this.savingsBackendClient.createWalletSKA({
      userAddress: this.aaAddress,
      activeStrategies,
      serializedSKA: serializedSKAData,
      chainId: this.chainId,
    });
  }

  async runDepositing(): Promise<void> {
    await this.savingsBackendClient.runDepositing({ chainId: this.chainId });
  }

  async getCurrentActiveStrategies(filter?: StrategiesFilter): Promise<DepositStrategy[]> {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    return (walletSKA?.activeStrategies ?? [])
      .map(activeStrategy => this.strategiesManager.getStrategy(activeStrategy.strategyId as DepositStrategyId))
      .filter(strategy => StrategiesManager.checkFilter(strategy, filter));
  }

  async deactivateAllStrategies(skipRevokeOnChain?: boolean) {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    if (!walletSKA) {
      return;
    }
    if (!skipRevokeOnChain) {
      await this.primaryAAAccount.sendTxnsAndWait([
        await this.primaryAAAccount.getRevokeSessionKeyTxn(walletSKA.sessionKeyAccountAddress),
      ]);
    }
    await this.savingsBackendClient.deleteWalletSKA(this.aaAddress, this.chainId);
  }

  async deposit({ depositStrategyId, amount }: WithdrawOrDepositParams): Promise<UserOpResult> {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    const txns = strategy.createDepositTxns({
      amount,
      paramValuesByKey: {
        // TODO: fetch parameter from strategy, do not use this constant here
        eoaAddress: this.privateKeyAccount.address,
        aaAddress: this.aaAddress,
      },
    });
    return this.primaryAAAccount.sendTxnsAndWait(txns);
  }

  async withdrawAll(pauseUntilDatetime?: PauseDepositingParams['pauseUntilDatetime']): Promise<UserOpResult> {
    this.pauseIfNeeded(pauseUntilDatetime);

    const currentActiveStrategies = await this.getCurrentActiveStrategies();
    const txns = await Promise.all(
      currentActiveStrategies.map(async strategy => {
        const params = await this.buildWithdrawParams(strategy);
        if (strategy.instantWithdraw) {
          return strategy.createWithdrawTxns(params);
        }
        return strategy.createInitiateWithdrawTxns(params);
      }),
    );
    return this.primaryAAAccount.sendTxnsAndWait(txns.flat());
  }

  async withdraw({ depositStrategyId, amount, pauseUntilDatetime }: InstantWithdrawParams): Promise<UserOpResult> {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    this.pauseIfNeeded(pauseUntilDatetime);
    const params = await this.buildWithdrawParams(strategy, amount);
    const txns = await strategy.createWithdrawTxns(params);
    return this.primaryAAAccount.sendTxnsAndWait(txns);
  }

  async initiateWithdraw({
    depositStrategyId,
    amount,
    pauseUntilDatetime,
  }: MultistepWithdrawParams): Promise<UserOpResult> {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    this.pauseIfNeeded(pauseUntilDatetime);
    const params = await this.buildWithdrawParams(strategy, amount);
    const txns = await strategy.createInitiateWithdrawTxns(params);
    return this.primaryAAAccount.sendTxnsAndWait(txns);
  }

  async getWithdrawStatus(depositStrategyId: MultistepWithdrawStrategyId): Promise<WithdrawStatus> {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    return strategy.getWithdrawStatus({
      // TODO: fetch parameter from strategy, do not use this constant here
      eoaAddress: this.privateKeyAccount.address,
      aaAddress: this.aaAddress,
    });
  }

  async completeWithdraw({
    depositStrategyId,
    amount,
    pauseUntilDatetime,
  }: MultistepWithdrawParams): Promise<UserOpResult> {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    this.pauseIfNeeded(pauseUntilDatetime);
    const paramValuesByKey = {
      // TODO: fetch parameter from strategy, do not use this constant here
      eoaAddress: this.privateKeyAccount.address,
      aaAddress: this.aaAddress,
    };
    const txns = await strategy.createCompleteWithdrawTxns({
      amount: amount ?? (await strategy.getWithdrawStatus(paramValuesByKey)).amount,
      paramValuesByKey,
    });
    return this.primaryAAAccount.sendTxnsAndWait(txns);
  }

  // TODO: consider refactoring auth message logic into separate class
  async getUser(): Promise<Awaited<GetUserReturnType> | undefined> {
    try {
      return await this.savingsBackendClient.getUser();
    } catch (e) {
      // 401 mean that user is not authorized, but request is valid
      // TODO: remove expect error when typed errors will be added.
      // @ts-expect-error errors are not typed yet
      if (e?.response?.status === 401) {
        return undefined;
      }
      // otherwise there is some problem with the request and we throw
      throw e;
    }
  }

  async auth(): ReturnType<SavingsBackendClient['auth']> {
    const authMessage = this.createAuthMessage();
    const signedMessage = await this.signMessage(authMessage);
    const authResponse = await this.savingsBackendClient.auth({
      signedMessage,
      message: authMessage,
    });
    this.savingsBackendClient.setAuthHeaders(authResponse.token);
    return authResponse;
  }

  setAuthToken(authToken: string): void {
    this.savingsBackendClient.setAuthHeaders(authToken);
  }

  private pauseIfNeeded(pauseUntilDatetime: PauseDepositingParams['pauseUntilDatetime']) {
    if (pauseUntilDatetime) {
      this.savingsBackendClient
        .pauseDepositing({
          pauseUntilDatetime,
        })
        // eslint-disable-next-line no-console
        .catch(error => console.error(error));
    }
  }

  private async buildWithdrawParams(strategy: DepositStrategy, amount?: bigint) {
    return {
      amount: amount ?? (await strategy.getBondTokenBalance(this.primaryAAAccount.aaAddress)),
      paramValuesByKey: {
        // TODO: fetch parameter from strategy, do not use this constant here
        eoaAddress: this.privateKeyAccount.address,
        aaAddress: this.aaAddress,
      },
    };
  }

  private createAuthMessage(): WallchainAuthMessage {
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min in milliseconds
    const expiresInt = Math.floor(expires.getTime() / 1000); // Convert to seconds
    return {
      info: 'Confirm Address for Wallchain Auto-Yield',
      expires: expiresInt,
    };
  }

  private async signMessage(message: WallchainAuthMessage) {
    return this.privateKeyAccount.signTypedData({
      domain: {
        name: 'WallchainAuthMessage',
      },
      types: {
        WallchainAuthMessage: [
          { name: 'info', type: 'string' },
          { name: 'expires', type: 'uint256' },
        ],
      },
      primaryType: 'WallchainAuthMessage',
      message: {
        ...message,
        expires: BigInt(message.expires),
      },
    });
  }
}
