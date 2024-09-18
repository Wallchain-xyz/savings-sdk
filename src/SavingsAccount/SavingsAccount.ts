import axios from 'axios';
import { Address, PrivateKeyAccount } from 'viem';

import { UserOpResult } from '../AAProviders/shared/AAAccount';
import { SupportedChainId } from '../AAProviders/shared/chains';
import { PrimaryAAAccount } from '../AAProviders/shared/PrimaryAAAccount';
import {
  ActiveStrategy,
  Distribution,
  GetUserReturnType,
  PauseDepositingParams,
  SavingsBackendClient,
  WallchainAuthMessage,
} from '../api/SavingsBackendClient';

import { DepositStrategy, DepositStrategyId, PendingWithdrawal } from '../depositStrategies/DepositStrategy';
import { MultiStepWithdrawStrategyId, SingleStepWithdrawStrategyId } from '../depositStrategies/strategies';
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

interface SingleStepWithdrawParams
  extends Omit<WithdrawOrDepositParams, 'amount'>,
    Omit<PauseDepositingParams, 'chainId'> {
  depositStrategyId: SingleStepWithdrawStrategyId;
  amount?: bigint;
}

interface StartMultiStepWithdrawParams
  extends Omit<WithdrawOrDepositParams, 'amount'>,
    Omit<PauseDepositingParams, 'chainId'> {
  depositStrategyId: MultiStepWithdrawStrategyId;
  amount?: bigint;
}

interface ContinueMultiStepWithdrawParams
  extends Omit<WithdrawOrDepositParams, 'amount'>,
    Omit<PauseDepositingParams, 'chainId'> {
  depositStrategyId: MultiStepWithdrawStrategyId;
}

interface ActivateStrategiesParams {
  activeStrategies: ActiveStrategy[];
  skipRevokeOnChain?: boolean;
}

export interface PointsByProtocol {
  etherFiPoints: number;
  renzoPoints: number;
  eigenLayerPoints: number;
  mellowPoints: number;
  symbioticPoints: number;
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

  activateStrategies = async ({ activeStrategies, skipRevokeOnChain }: ActivateStrategiesParams): Promise<void> => {
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
  };

  async depositDistribution({ distribution, amount }: { distribution: Distribution; amount?: bigint }): Promise<void> {
    await this.savingsBackendClient.depositDistribution({
      distribution,
      chainId: this.chainId,
      amount,
    });
  }

  getCurrentActiveStrategies = async (filter?: StrategiesFilter): Promise<DepositStrategy[]> => {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    return (walletSKA?.activeStrategies ?? [])
      .map(activeStrategy => this.strategiesManager.getStrategy(activeStrategy.strategyId))
      .filter(strategy => StrategiesManager.checkFilter(strategy, filter));
  };

  deactivateAllStrategies = async (skipRevokeOnChain?: boolean) => {
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
  };

  deposit = async ({ depositStrategyId, amount }: WithdrawOrDepositParams): Promise<UserOpResult> => {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    const txns = await strategy.createDepositTxns({
      amount,
      paramValuesByKey: {
        // TODO: fetch parameter from strategy, do not use this constant here
        eoaAddress: this.privateKeyAccount.address,
        aaAddress: this.aaAddress,
      },
    });
    return this.primaryAAAccount.sendTxnsAndWait(txns);
  };

  withdrawAll = async (pauseUntilDatetime?: PauseDepositingParams['pauseUntilDatetime']): Promise<UserOpResult> => {
    this.pauseIfNeeded(pauseUntilDatetime);

    const currentActiveStrategies = await this.getCurrentActiveStrategies();
    const txns = await Promise.all(
      currentActiveStrategies.map(async strategy => {
        const params = await this.buildWithdrawParams(strategy);
        if (strategy.isSingleStepWithdraw) {
          return strategy.createWithdrawTxns(params);
        }
        return strategy.createWithdrawStepTxns(0, params);
      }),
    );
    return this.primaryAAAccount.sendTxnsAndWait(txns.flat());
  };

  singleStepWithdraw = async ({
    depositStrategyId,
    amount,
    pauseUntilDatetime,
  }: SingleStepWithdrawParams): Promise<UserOpResult> => {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    this.pauseIfNeeded(pauseUntilDatetime);
    const params = await this.buildWithdrawParams(strategy, amount);
    const txns = await strategy.createWithdrawTxns(params);
    return this.primaryAAAccount.sendTxnsAndWait(txns);
  };

  startMultiStepWithdraw = async ({
    depositStrategyId,
    amount,
    pauseUntilDatetime,
  }: StartMultiStepWithdrawParams): Promise<UserOpResult> => {
    const strategy = this.strategiesManager.getStrategy<MultiStepWithdrawStrategyId>(depositStrategyId);
    this.pauseIfNeeded(pauseUntilDatetime);
    const params = await this.buildWithdrawParams(strategy, amount);
    const txns = await strategy.createWithdrawStepTxns(0, params);
    return this.primaryAAAccount.sendTxnsAndWait(txns);
  };

  continueMultiStepWithdraw = async ({
    depositStrategyId,
    pauseUntilDatetime,
  }: ContinueMultiStepWithdrawParams): Promise<UserOpResult> => {
    const strategy = this.strategiesManager.getStrategy<MultiStepWithdrawStrategyId>(depositStrategyId);
    this.pauseIfNeeded(pauseUntilDatetime);
    const withdrawal = await this.getPendingWithdrawal(depositStrategyId);
    if (!withdrawal.isStepCanBeExecuted) {
      throw new Error('Next step of withdrawal cannot be executed at this moment');
    }
    const params = await this.buildWithdrawParams(strategy, withdrawal.amount);
    const txns = await strategy.createWithdrawStepTxns(withdrawal.currentStep, params);
    return this.primaryAAAccount.sendTxnsAndWait(txns);
  };

  getPendingWithdrawal = async (depositStrategyId: MultiStepWithdrawStrategyId): Promise<PendingWithdrawal> => {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    return strategy.getPendingWithdrawal(this.aaAddress);
  };

  // TODO: consider refactoring auth message logic into separate class
  getUser = async (): Promise<Awaited<GetUserReturnType> | undefined> => {
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
  };

  auth = async (): ReturnType<SavingsBackendClient['auth']> => {
    const authMessage = this.createAuthMessage();
    const signedMessage = await this.signMessage(authMessage);
    const authResponse = await this.savingsBackendClient.auth({
      signedMessage,
      message: authMessage,
    });
    this.savingsBackendClient.setAuthHeaders(authResponse.token);
    return authResponse;
  };

  setAuthToken = (authToken: string): void => {
    this.savingsBackendClient.setAuthHeaders(authToken);
  };

  getPointsByProtocol = async (): Promise<PointsByProtocol> => {
    const [etherFiResp, renzoResp] = await Promise.all([
      axios.get(`https://app.ether.fi/api/portfolio/v3/${this.aaAddress}`),
      axios.get(`https://app.renzoprotocol.com/api/points/${this.aaAddress}`),
    ]);
    return {
      etherFiPoints: etherFiResp.data.totalIntegrationLoyaltyPoints,
      renzoPoints: renzoResp.data.data.totals.renzoPoints,
      eigenLayerPoints: renzoResp.data.data.totals.eigenLayerPoints,
      mellowPoints: renzoResp.data.data.totals.mellowPoints,
      symbioticPoints: renzoResp.data.data.totals.symbioticPoints,
    };
  };

  private pauseIfNeeded = (pauseUntilDatetime: PauseDepositingParams['pauseUntilDatetime']) => {
    if (pauseUntilDatetime) {
      this.savingsBackendClient
        .pauseDepositing({
          pauseUntilDatetime,
        })
        // eslint-disable-next-line no-console
        .catch(error => console.error(error));
    }
  };

  private buildWithdrawParams = async (strategy: DepositStrategy, amount?: bigint) => {
    let amountToWithdraw = amount;
    if (!amountToWithdraw) {
      amountToWithdraw = await strategy.getBondTokenBalance(this.primaryAAAccount.aaAddress);
    }
    return {
      amount: amountToWithdraw,
      paramValuesByKey: {
        // TODO: fetch parameter from strategy, do not use this constant here
        eoaAddress: this.privateKeyAccount.address,
        aaAddress: this.aaAddress,
      },
    };
  };

  private createAuthMessage = (): WallchainAuthMessage => {
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min in milliseconds
    const expiresInt = Math.floor(expires.getTime() / 1000); // Convert to seconds
    return {
      info: 'Confirm Address for Wallchain Auto-Yield',
      expires: expiresInt,
    };
  };

  private signMessage = async (message: WallchainAuthMessage) =>
    this.privateKeyAccount.signTypedData({
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
