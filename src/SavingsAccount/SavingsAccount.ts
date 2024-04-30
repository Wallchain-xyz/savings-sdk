import { KernelAccountClient } from '@zerodev/sdk/clients/kernelAccountClient';

import { Address, Chain, Transport } from 'viem';

import { AAManager, WithdrawOrDepositParams } from '../AAManager/AAManager';
import { PauseDepositingParams, SavingsBackendClient } from '../api/SavingsBackendClient';
import { NetworkEnum } from '../api/thecat/__generated__/createApiClient';

import { getDepositStrategyById } from '../depositStrategies/getDepositStrategyById';

import { createAuthMessage } from './createAuthMessage';

import type { DepositStrategy, DepositStrategyId } from '../depositStrategies/DepositStrategy';
import type { KernelSmartAccount } from '@zerodev/sdk/accounts';

interface ConstructorParams {
  aaManager: AAManager;
  savingsBackendClient: SavingsBackendClient;
  chainId: NetworkEnum;
}

interface WithdrawParams extends WithdrawOrDepositParams, Omit<PauseDepositingParams, 'chainId'> {}

export class SavingsAccount {
  private savingsBackendClient: SavingsBackendClient;

  private aaManager: AAManager;

  chainId: NetworkEnum;

  constructor({ aaManager, savingsBackendClient, chainId }: ConstructorParams) {
    this.savingsBackendClient = savingsBackendClient;
    this.aaManager = aaManager;
    this.chainId = chainId;
  }

  get aaAddress(): Address {
    return this.aaManager.aaAddress;
  }

  // TODO: @melrin not sure we want to expose this
  get aaAccountClient() {
    // TODO: @merlin find better typing here
    return this.aaManager.aaAccountClient as KernelAccountClient<Transport, Chain, KernelSmartAccount>;
  }

  async auth() {
    const authMessage = createAuthMessage(this.aaAddress);
    const signedMessage = await this.aaManager.signMessage(authMessage);
    return this.savingsBackendClient.auth({
      signedMessage,
      message: authMessage,
      chainId: this.chainId,
    });
  }

  async activateStrategies(strategyIds: DepositStrategyId[]): Promise<void> {
    const skaAddressPromise = this.savingsBackendClient.getSKAPublicKey(this.chainId);
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    if (walletSKA) {
      // TODO: @merlin think about transactions here, what if chain fails in the middle
      await this.aaManager.revokeSKA(walletSKA.sessionKeyAccountAddress);
      await this.savingsBackendClient.deleteWalletSKA(this.aaAddress, this.chainId);
    }

    const newStrategyIds = await this.mergeWithActiveStrategyIds(strategyIds);

    const skaAddress = await skaAddressPromise;
    const serializedSKA = await this.aaManager.signSKA({
      sessionKeyAccountAddress: skaAddress,
      depositStrategyIds: newStrategyIds,
    });

    await this.savingsBackendClient.createWalletSKA({
      userAddress: this.aaAddress,
      depositStrategyIds: newStrategyIds,
      serializedSKA,
      chainId: this.chainId,
    });
  }

  private async mergeWithActiveStrategyIds(strategyIds: DepositStrategyId[]) {
    const activeStrategyIds = (await this.getActiveStrategies()).map(strategy => strategy.id);
    return Array.from(new Set([...activeStrategyIds, ...strategyIds]));
  }

  async getActiveStrategies(): Promise<DepositStrategy[]> {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    return walletSKA?.depositStrategyIds.map(getDepositStrategyById) ?? [];
  }

  async deactivateAllStrategies() {
    const walletSKA = await this.savingsBackendClient.getWalletSKA(this.aaAddress, this.chainId);
    if (!walletSKA) {
      return;
    }
    await this.aaManager.revokeSKA(walletSKA.sessionKeyAccountAddress);
    await this.savingsBackendClient.deleteWalletSKA(this.aaAddress, this.chainId);
  }

  async withdraw(params: WithdrawParams) {
    const { depositStrategyId } = params;
    const depositStrategy = getDepositStrategyById(depositStrategyId);

    await this.savingsBackendClient.pauseDepositing({
      chainId: depositStrategy.chainId,
      ...params,
    });
    return this.aaManager.withdraw(params);
  }

  async deposit(params: WithdrawOrDepositParams) {
    return this.aaManager.deposit(params);
  }

  // //   =========== DEPOSITS ==========
  // getDeposits() {
  //   throw new Error('not implemented');
  // }
  //
  // // ============= USER OPS ==========
  // prepareEnsureTokenAvailableUserOp(
  //   tokenAddress: Address,
  //   tokenAmount: TokenAmount,
  // ) {
  //   // GET: deposit_service/:user_address/prepare-ensure-token-available {tokenAmount, tokenAddress, chain}  -> WithdrawalParams[]
  //   throw new Error('not implemented');
  // }
  //
  // sendUserOps: (userOps: UserOp[]) => TxnHash;
  // txnToUserOp: (txn: Txn) => UserOp;
  //
  // // just for tests:
  // _prepareAddDepositUserOp: (
  //   depositStrategyId: DepositStrategyId,
  //   tokenAmount: TokenAmount,
  // ) => UserOp;
  // // - POST: thecat/b/v2/transactions/setup_add_deposit {depositStrategyId, tokenAmount} -> userOp
  // // - POST: session_key_account_manager_service/session_key_account/:user_address/execute_user_operation {userOp} -> userOpHash
  //
  // _prepareWithdrawDepositUserOp: (
  //   depositStrategyId: DepositStrategyId,
  //   tokenAmount: TokenAmount,
  // ) => UserOp;
  // // - POST: thecat/b/v2/transactions/setup_withdraw_deposit {depositStrategyId, tokenAmount} -> userOp
  // // - POST: session_key_account_manager_service/session_key_account/:user_address/execute_user_operation {userOp} -> userOpHash
}
