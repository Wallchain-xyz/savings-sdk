import { BiconomySmartAccountV2 } from '@biconomy/account';

import { Address, Hash } from 'viem';

import { AAAccount, UserOpResult, WaitForUserOpToLandParams } from '../shared/AAAccount';
import { Txn } from '../shared/Txn';
import { UserOperationV06 } from '../shared/UserOperationV06';

import { userOpToBiconomyUserOpStruct } from './shared';

interface BiconomyAAAccountParams {
  aaAddress: Address;
  smartAccount: BiconomySmartAccountV2;
}

export abstract class BiconomyAAAccount extends AAAccount {
  aaAddress: Address;

  protected smartAccount: BiconomySmartAccountV2;

  protected constructor({ aaAddress, smartAccount }: BiconomyAAAccountParams) {
    super();
    this.aaAddress = aaAddress;
    this.smartAccount = smartAccount;
  }

  abstract buildUserOp(txns: Txn[]): Promise<UserOperationV06>;

  async sendUserOp(userOp: UserOperationV06): Promise<Hash> {
    const { userOpHash } = await this.smartAccount.sendUserOp(userOpToBiconomyUserOpStruct(userOp));
    return userOpHash as Hash;
  }

  waitForUserOp(userOpHash: Hash, waitForUserOpToLandParams?: WaitForUserOpToLandParams): Promise<UserOpResult> {
    const maxDurationMS = waitForUserOpToLandParams?.maxDurationMS ?? this.waitForUserOpToLandParams.maxDurationMS;
    const pollingIntervalMS =
      waitForUserOpToLandParams?.pollingIntervalMS ?? this.waitForUserOpToLandParams.pollingIntervalMS;
    let totalDuration = 0;
    if (!this.smartAccount.bundler) {
      throw new Error('Bundler is not set');
    }
    const { bundler } = this.smartAccount;

    return new Promise<UserOpResult>((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          const userOpReceipt = await bundler.getUserOpReceipt(userOpHash);
          if (userOpReceipt?.receipt?.blockNumber) {
            clearInterval(intervalId);
            resolve({
              txnHash: userOpReceipt.receipt.transactionHash,
              success: userOpReceipt.receipt.status === 'success',
            });
            return;
          }
        } catch (error) {
          const notFoundError = error instanceof Error && error.message === 'User op not found';
          if (!notFoundError) {
            clearInterval(intervalId);
            reject(error);
            return;
          }
        }

        totalDuration += pollingIntervalMS;
        if (totalDuration >= maxDurationMS) {
          clearInterval(intervalId);
          reject(
            new Error(
              `Exceeded maximum duration (${
                maxDurationMS / 1000
              } sec) waiting to get receipt for userOpHash ${userOpHash}. Try getting the receipt manually using eth_getUserOperationReceipt rpc method on bundler`,
            ),
          );
        }
      }, pollingIntervalMS);
    });
  }
}
