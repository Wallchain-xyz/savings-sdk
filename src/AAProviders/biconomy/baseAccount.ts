import { BiconomySmartAccountV2 } from '@biconomy/account';

import { Address, Hash } from 'viem';

import { BaseAAAccount, Txn, UserOperationV06, WaitParams } from '../types';

import { denormalizeUserOp } from './common';

interface BiconomyBaseAAAccountParams {
  aaAddress: Address;
  smartAccount: BiconomySmartAccountV2;
}

export abstract class BaseBiconomyAAAccount implements BaseAAAccount {
  aaAddress: Address;

  protected smartAccount: BiconomySmartAccountV2;

  protected constructor({ aaAddress, smartAccount }: BiconomyBaseAAAccountParams) {
    this.aaAddress = aaAddress;
    this.smartAccount = smartAccount;
  }

  abstract buildUserOp(txns: Txn[]): Promise<UserOperationV06>;

  async sendUserOp(userOp: UserOperationV06): Promise<Hash> {
    const { userOpHash } = await this.smartAccount.sendUserOp(denormalizeUserOp(userOp));
    return userOpHash as Hash;
  }

  async sendTxns(txns: Txn[]): Promise<Hash> {
    const userOp = await this.buildUserOp(txns);
    return this.sendUserOp(userOp);
  }

  waitForUserOp(userOpHash: Hash, params?: WaitParams): Promise<void> {
    const maxDuration = params?.maxDurationMS || 20000; // default 20 seconds
    const intervalValue = params?.pollingIntervalMS || 500; // default 0.5 seconds
    let totalDuration = 0;
    if (!this.smartAccount.bundler) {
      throw new Error('Bundler is not set');
    }
    const { bundler } = this.smartAccount;

    return new Promise<void>((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          const userOpReceipt = await bundler.getUserOpReceipt(userOpHash);
          if (userOpReceipt?.receipt?.blockNumber) {
            clearInterval(intervalId);
            resolve();
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

        totalDuration += intervalValue;
        if (totalDuration >= maxDuration) {
          clearInterval(intervalId);
          reject(
            new Error(
              `Exceeded maximum duration (${
                maxDuration / 1000
              } sec) waiting to get receipt for userOpHash ${userOpHash}. Try getting the receipt manually using eth_getUserOperationReceipt rpc method on bundler`,
            ),
          );
        }
      }, intervalValue);
    });
  }
}
