import type { Address, PrivateKeyAccount } from "viem";
import { createPublicClient, http } from "viem";
import { addressToEmptyAccount, createKernelAccount } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  revokeSessionKey,
  serializeSessionKeyAccount,
  signerToSessionKeyValidator,
} from "@zerodev/session-key";

import type { createApiClient } from "../api/createApiClient";
import type { AAAccountClient } from "../SavingsSDK/createAAAccountClientFromPrivateKeyAccount";
import type {
  DepositStrategy,
  DepositStrategyId,
  ValidatorData,
} from "../depositStrategies/DepositStrategy";
import { getDepositStrategyById } from "../depositStrategies/getDepositStrategyById";

export interface PrepareSessionKeyAccountParams {
  sessionKeyAccountAddress: Address;
  validatorData: ValidatorData;
}
type SessionKeyAccountServiceClient = ReturnType<typeof createApiClient>;
// type TokenAmount = Hex;

export interface CreateSessionKeyAccountParams {
  validatorData: PrepareSessionKeyAccountParams["validatorData"];
}

interface ConstructorParams {
  privateKeyAccount: PrivateKeyAccount;
  aaAccountClient: AAAccountClient;
  savingsBackendClient: SessionKeyAccountServiceClient;
  bundlerAPIKey: string;
}
export class SavingsAccount {
  public aaAccountClient: AAAccountClient;
  private readonly privateKeyAccount: PrivateKeyAccount;
  private savingsBackendClient: SessionKeyAccountServiceClient;
  private readonly bundlerAPIKey: string;

  get aaAddress(): Address {
    return this.aaAccountClient.account.address;
  }

  constructor({
    privateKeyAccount,
    savingsBackendClient,
    aaAccountClient,
    bundlerAPIKey,
  }: ConstructorParams) {
    this.privateKeyAccount = privateKeyAccount;
    this.savingsBackendClient = savingsBackendClient;
    this.aaAccountClient = aaAccountClient;
    // TODO: @merlin ideally we should not pass aaAccountClient and bundlerAPIKey at the same time
    // since aaAccountClient already have bundlerAPIKey inside as well as sudo validator
    // for SKA and main aaAccount should be the same
    // we could pass here privateKeyAccount and create aaAccountClient,
    // but then constructor will have to be async
    this.bundlerAPIKey = bundlerAPIKey;
  }

  // =====starts ====
  async activateStrategies(
    additionalDepositStrategyIds: DepositStrategyId[]
  ): Promise<void> {
    const activeDepositStrategies = await this.getActiveStrategies();
    const activeDepositStrategyIds = activeDepositStrategies.map(
      (depositStrategy) => depositStrategy.id
    );
    const newActiveDepositStrategyIds = new Set([
      ...activeDepositStrategyIds,
      ...additionalDepositStrategyIds,
    ]);
    const newActiveDepositStrategies = Array.from(
      newActiveDepositStrategyIds
    ).map(getDepositStrategyById);
    const combinedPermissions = newActiveDepositStrategies.flatMap(
      (depositStrategy) => depositStrategy.permissions
    );
    const validatorData = {
      permissions: combinedPermissions,
    };

    try {
      const walletSessionKeyAccount = await this.getWalletSessionKeyAccount();
      const sessionKeyAccountAddress =
        walletSessionKeyAccount.sessionKeyAccountAddress;
      await revokeSessionKey(this.aaAccountClient, sessionKeyAccountAddress);
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
    const sessionKeyAccountAddress =
      walletSessionKeyAccount.sessionKeyAccountAddress;
    await revokeSessionKey(this.aaAccountClient, sessionKeyAccountAddress);
    //   TODO: @merlin add delete request to backend
  }

  //  ===== END STRATS ====

  async createAndSignSessionKeyAccount({
    validatorData,
  }: CreateSessionKeyAccountParams) {
    try {
      const walletSessionKeyAccount = await this.getWalletSessionKeyAccount();

      if (walletSessionKeyAccount.isSigned) {
        return;
      }

      await this.signSessionKeyAccount({
        sessionKeyAccountAddress:
          walletSessionKeyAccount.sessionKeyAccountAddress,
        validatorData,
      });
    } catch (error) {
      const walletSessionKeyAccount = await this.savingsBackendClient.post(
        "/b/v2/session_key_account_manager_service/session_key_account/:user_address",
        undefined,
        {
          params: {
            user_address: this.aaAddress,
          },
        }
      );
      await this.signSessionKeyAccount({
        sessionKeyAccountAddress:
          walletSessionKeyAccount.sessionKeyAccountAddress,
        validatorData,
      });
    }
  }

  private async getWalletSessionKeyAccount() {
    // TODO: @merlin maybe we can use cache here
    return this.savingsBackendClient.get(
      "/b/v2/session_key_account_manager_service/session_key_account/:user_address",
      {
        params: {
          user_address: this.aaAddress,
        },
      }
    );
  }

  private async signSessionKeyAccount({
    sessionKeyAccountAddress,
    validatorData,
  }: PrepareSessionKeyAccountParams) {
    const aaBundlerTransport = http(
      `https://rpc.zerodev.app/api/v2/bundler/${this.bundlerAPIKey}`
    );
    const publicClient = createPublicClient({
      transport: aaBundlerTransport,
    });

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer: this.privateKeyAccount,
    });

    const emptySessionKeySigner = addressToEmptyAccount(
      sessionKeyAccountAddress
    );

    const sessionKeyValidator = await signerToSessionKeyValidator(
      publicClient,
      {
        signer: emptySessionKeySigner,
        validatorData,
      }
    );

    const sessionKeyAccount = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
        regular: sessionKeyValidator,
      },
    });

    const serializedSessionKey = await serializeSessionKeyAccount(
      sessionKeyAccount
    );

    // TODO: @merlin attach strategyIds
    return this.savingsBackendClient.patch(
      "/b/v2/session_key_account_manager_service/session_key_account/:user_address/serialized_session_key",
      {
        serializedSessionKey,
      },
      {
        params: {
          user_address: this.aaAddress,
        },
      }
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
