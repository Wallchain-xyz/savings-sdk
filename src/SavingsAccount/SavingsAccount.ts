import { KernelAccountClient } from '@zerodev/sdk/clients/kernelAccountClient';

import { Address, Chain, Transport } from 'viem';

import { AAManager, WithdrawParams } from '../AAManager/AAManager';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { NetworkEnum } from '../api/thecat/__generated__/createApiClient';

import { getDepositStrategyById } from '../depositStrategies/getDepositStrategyById';

import type { DepositStrategy, DepositStrategyId } from '../depositStrategies/DepositStrategy';
import type { KernelSmartAccount } from '@zerodev/sdk/accounts';

interface ConstructorParams {
  aaManager: AAManager;
  savingsBackendClient: SavingsBackendClient;
  chainId: NetworkEnum;
}

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

  async activateStrategies(strategyIds: DepositStrategyId[]): Promise<void> {
    let walletSessionKeyAccount = await this.savingsBackendClient.getWalletSessionKeyAccount(
      this.aaAddress,
      this.chainId,
    );
    if (walletSessionKeyAccount) {
      // TODO: @merlin think about transactions here, what if chain fails in the middle
      await this.aaManager.revokeSKA(walletSessionKeyAccount.sessionKeyAccountAddress);
    } else {
      walletSessionKeyAccount = await this.savingsBackendClient.createWalletSessionKeyAccount(
        this.aaAddress,
        this.chainId,
      );
    }

    const { sessionKeyAccountAddress } = walletSessionKeyAccount;

    const newStrategyIds = await this.mergeWithActiveStrategyIds(strategyIds);

    const serializedSessionKey = await this.aaManager.signSKA({
      sessionKeyAccountAddress,
      depositStrategyIds: newStrategyIds,
    });

    await this.savingsBackendClient.updateWalletSessionKeyAccount({
      userAddress: this.aaAddress,
      depositStrategyIds: newStrategyIds,
      serializedSessionKey,
      chainId: this.chainId,
    });
  }

  private async mergeWithActiveStrategyIds(strategyIds: DepositStrategyId[]) {
    const activeStrategyIds = (await this.getActiveStrategies()).map(strategy => strategy.id);
    return Array.from(new Set([...activeStrategyIds, ...strategyIds]));
  }

  async getActiveStrategies(): Promise<DepositStrategy[]> {
    const walletSessionKeyAccount = await this.savingsBackendClient.getWalletSessionKeyAccount(
      this.aaAddress,
      this.chainId,
    );
    return walletSessionKeyAccount?.depositStrategyIds.map(getDepositStrategyById) ?? [];
  }

  async deactivateAllStrategies() {
    const walletSessionKeyAccount = await this.savingsBackendClient.getWalletSessionKeyAccount(
      this.aaAddress,
      this.chainId,
    );
    if (!walletSessionKeyAccount) {
      return;
    }
    await this.aaManager.revokeSKA(walletSessionKeyAccount.sessionKeyAccountAddress);
    await this.savingsBackendClient.deleteWalletSessionKeyAccount(this.aaAddress, this.chainId);
  }

  async withdraw(params: WithdrawParams) {
    return this.aaManager.withdraw(params);
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
