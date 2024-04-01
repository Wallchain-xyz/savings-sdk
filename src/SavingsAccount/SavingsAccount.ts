import { KernelAccountClient } from '@zerodev/sdk/clients/kernelAccountClient';

import { AAManager } from '../AAManager/AAManager';
import { getDepositStrategyById } from '../depositStrategies/getDepositStrategyById';

import type { createApiClient } from '../api/createApiClient';
import type { DepositStrategy, DepositStrategyId, ValidatorData } from '../depositStrategies/DepositStrategy';
import type { KernelSmartAccount } from '@zerodev/sdk/accounts';
import type { Address, Chain, Transport } from 'viem';

interface PrepareSessionKeyAccountParams {
  sessionKeyAccountAddress: Address;
  validatorData: ValidatorData;
}

type SessionKeyAccountServiceClient = ReturnType<typeof createApiClient>;
// type TokenAmount = Hex;

interface CreateSessionKeyAccountParams {
  validatorData: PrepareSessionKeyAccountParams['validatorData'];
}

interface ConstructorParams {
  aaManager: AAManager;
  savingsBackendClient: SessionKeyAccountServiceClient;
}

export class SavingsAccount {
  private savingsBackendClient: SessionKeyAccountServiceClient;

  private aaManager: AAManager;

  constructor({ aaManager, savingsBackendClient }: ConstructorParams) {
    this.savingsBackendClient = savingsBackendClient;
    this.aaManager = aaManager;
  }

  get aaAddress(): Address {
    return this.aaManager.aaAddress;
  }

  // TODO: @melrin not sure we want to expose this
  get aaAccountClient() {
    // TODO: @merlin find better typing here
    return this.aaManager.aaAccountClient as KernelAccountClient<Transport, Chain, KernelSmartAccount>;
  }

  // =====starts ====
  async activateStrategies(additionalDepositStrategyIds: DepositStrategyId[]): Promise<void> {
    const activeDepositStrategies = await this.getActiveStrategies();
    const activeDepositStrategyIds = activeDepositStrategies.map(depositStrategy => depositStrategy.id);
    const newActiveDepositStrategyIds = new Set([...activeDepositStrategyIds, ...additionalDepositStrategyIds]);
    const newActiveDepositStrategies = Array.from(newActiveDepositStrategyIds).map(getDepositStrategyById);
    // TODO: @merlin remove permissions duplication
    const combinedPermissions = newActiveDepositStrategies.flatMap(depositStrategy => depositStrategy.permissions);
    const validatorData = {
      permissions: combinedPermissions,
    };

    try {
      const walletSessionKeyAccount = await this.getWalletSessionKeyAccount();
      const { sessionKeyAccountAddress } = walletSessionKeyAccount;
      await this.aaManager.revokeSKA(sessionKeyAccountAddress);

      await this.signSessionKeyAccount({
        validatorData,
        sessionKeyAccountAddress,
      });
    } catch (error) {
      //   TODO: @merlin check that this is 404
      await this.createAndSignSessionKeyAccount({
        validatorData,
      });
    }
  }

  async getActiveStrategies(): Promise<DepositStrategy[]> {
    try {
      await this.getWalletSessionKeyAccount();

      // return walletSessionKeyAccount.depositStrategyIds.map(
      //   getDepositStrategyById,
      // );
      return [];

      // TODO: @merlin check that error is not found
    } catch (error) {
      return [];
    }
  }

  async deactivateAllStrategies() {
    const walletSessionKeyAccount = await this.getWalletSessionKeyAccount();
    const { sessionKeyAccountAddress } = walletSessionKeyAccount;
    await this.aaManager.revokeSKA(sessionKeyAccountAddress);
    //   TODO: @merlin add delete request to backend
  }

  //  ===== END STRATS ====

  async createAndSignSessionKeyAccount({ validatorData }: CreateSessionKeyAccountParams) {
    try {
      const walletSessionKeyAccount = await this.getWalletSessionKeyAccount();

      if (walletSessionKeyAccount.isSigned) {
        return;
      }

      await this.signSessionKeyAccount({
        sessionKeyAccountAddress: walletSessionKeyAccount.sessionKeyAccountAddress,
        validatorData,
      });
    } catch (error) {
      // create session_key_account backend entity and get sessionKeyAccountAddress
      // back to sign permissions using it
      const walletSessionKeyAccount = await this.savingsBackendClient.post(
        '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
        undefined,
        {
          params: {
            user_address: this.aaAddress,
          },
        },
      );
      await this.signSessionKeyAccount({
        sessionKeyAccountAddress: walletSessionKeyAccount.sessionKeyAccountAddress,
        validatorData,
      });
    }
  }

  private async getWalletSessionKeyAccount() {
    // TODO: @merlin maybe we can use cache here
    return this.savingsBackendClient.get(
      '/b/v2/session_key_account_manager_service/session_key_account/:user_address',
      {
        params: {
          user_address: this.aaAddress,
        },
      },
    );
  }

  private async signSessionKeyAccount({ sessionKeyAccountAddress, validatorData }: PrepareSessionKeyAccountParams) {
    const serializedSessionKey = await this.aaManager.signSKA({
      sessionKeyAccountAddress,
      validatorData,
    });

    // send session key to backend
    // TODO: @merlin attach strategyIds
    return this.savingsBackendClient.patch(
      '/b/v2/session_key_account_manager_service/session_key_account/:user_address/serialized_session_key',
      {
        serializedSessionKey,
      },
      {
        params: {
          user_address: this.aaAddress,
        },
      },
    );
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
