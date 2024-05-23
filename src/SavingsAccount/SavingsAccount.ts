import { Address, PrivateKeyAccount } from 'viem';

import { AAAccount, Paymaster, Txn, UserOpResult } from '../AAProviders/types';
import { ChainId } from '../api/auth/__generated__/createApiClient';
import { PauseDepositingParams, SavingsBackendClient, WallchainAuthMessage } from '../api/SavingsBackendClient';

import { ActiveStrategy } from '../api/ska/__generated__/createApiClient';

import { AccountDepositStrategy } from '../depositStrategies/AccountDepositStrategy';
import { DepositStrategyId } from '../depositStrategies/DepositStrategy';
import { StrategiesFilter, StrategiesManager } from '../depositStrategies/StrategiesManager';

interface ConstructorParams {
  aaAccount: AAAccount;
  privateKeyAccount: PrivateKeyAccount;
  savingsBackendClient: SavingsBackendClient;
  strategiesManager: StrategiesManager;
  paymaster: Paymaster;
  chainId: ChainId;
}

interface WithdrawOrDepositParams {
  depositStrategyId: DepositStrategyId;
  amount: bigint;
}

interface WithdrawParams extends WithdrawOrDepositParams, Omit<PauseDepositingParams, 'chainId'> {}

interface ActivateStrategiesParams {
  activeStrategies: ActiveStrategy[];
  skipRevokeOnChain?: boolean;
}

export class SavingsAccount {
  private savingsBackendClient: SavingsBackendClient;

  private privateKeyAccount: PrivateKeyAccount;

  private paymaster: Paymaster;

  chainId: ChainId;

  aaAccount: AAAccount;

  strategiesManager: StrategiesManager;

  constructor({
    aaAccount,
    privateKeyAccount,
    savingsBackendClient,
    strategiesManager,
    chainId,
    paymaster,
  }: ConstructorParams) {
    this.savingsBackendClient = savingsBackendClient;
    // TODO: accept rpc urls in config, use viem default otherwise
    this.strategiesManager = strategiesManager;
    this.chainId = chainId;
    this.aaAccount = aaAccount;
    this.privateKeyAccount = privateKeyAccount;
    this.paymaster = paymaster;
  }

  get aaAddress(): Address {
    return this.aaAccount.aaAddress;
  }

  async auth() {
    const authMessage = this.createAuthMessage();
    const signedMessage = await this.signMessage(authMessage);
    return this.savingsBackendClient.auth({
      signedMessage,
      message: authMessage,
      chainId: this.chainId,
    });
  }

  async activateStrategies({ activeStrategies, skipRevokeOnChain }: ActivateStrategiesParams): Promise<void> {
    await this.deactivateAllStrategies(skipRevokeOnChain);

    const { serializedSKAData, txnsToActivate } = await this.aaAccount.createSessionKey({
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
      await this.sendTxnsWithPaymasterAndWait(txnsToActivate);
    }

    await this.savingsBackendClient.createWalletSKA({
      userAddress: this.aaAddress,
      activeStrategies,
      serializedSKA: serializedSKAData,
      chainId: this.chainId,
    });
  }

  async getCurrentActiveStrategies(filter?: StrategiesFilter): Promise<AccountDepositStrategy[]> {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    return (walletSKA?.activeStrategies ?? [])
      .map(activeStrategy =>
        this.strategiesManager.getAccountStrategy(
          activeStrategy.strategyId,
          this.aaAddress,
          this.privateKeyAccount.address,
        ),
      )
      .filter(strategy => StrategiesManager.checkFilter(strategy, filter));
  }

  async deactivateAllStrategies(skipRevokeOnChain?: boolean) {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    if (!walletSKA) {
      return;
    }
    if (!skipRevokeOnChain) {
      await this.sendTxnsWithPaymasterAndWait([
        await this.aaAccount.getRevokeSessionKeyTxn(walletSKA.sessionKeyAccountAddress),
      ]);
    }
    await this.savingsBackendClient.deleteWalletSKA(this.aaAddress, this.chainId);
  }

  async deposit({ depositStrategyId, amount }: WithdrawOrDepositParams): Promise<UserOpResult> {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    const txns = await strategy.createDepositTxns({
      amount,
      paramValuesByKey: {
        // TODO: fetch parameter from strategy, do not use this constant here
        eoaAddress: this.privateKeyAccount.address,
        aaAddress: this.aaAddress,
      },
    });
    return this.sendTxnsWithPaymasterAndWait(txns);
  }

  async withdraw({ depositStrategyId, amount, pauseUntilDatetime }: WithdrawParams): Promise<UserOpResult> {
    const strategy = this.strategiesManager.getStrategy(depositStrategyId);
    if (pauseUntilDatetime) {
      await this.savingsBackendClient.pauseDepositing({
        chainId: strategy.chainId,
        pauseUntilDatetime,
      });
    }
    const txns = await strategy.createWithdrawTxns({
      amount,
      paramValuesByKey: {
        // TODO: fetch parameter from strategy, do not use this constant here
        eoaAddress: this.privateKeyAccount.address,
        aaAddress: this.aaAddress,
      },
    });
    return this.sendTxnsWithPaymasterAndWait(txns);
  }

  private async sendTxnsWithPaymasterAndWait(txns: Txn[]): Promise<UserOpResult> {
    const userOp = await this.aaAccount.buildUserOp(txns);
    const sponsoredUserOp = await this.paymaster.addPaymasterIntoUserOp(userOp);
    const userOpHash = await this.aaAccount.sendUserOp(sponsoredUserOp);
    return this.aaAccount.waitForUserOp(userOpHash);
  }

  // TODO: consider refactoring auth message logic into separate class
  private createAuthMessage(): WallchainAuthMessage {
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    const expiresInt = Math.floor(expires.getTime() / 1000); // Convert to seconds
    return {
      info: 'Confirm Address for Wallchain Auto-Yield',
      aa_address: this.aaAddress,
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
          { name: 'aa_address', type: 'address' },
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
