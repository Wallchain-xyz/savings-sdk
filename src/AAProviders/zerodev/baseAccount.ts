import { ENTRYPOINT_ADDRESS_V06, bundlerActions } from 'permissionless';
import { Hash } from 'viem';

import { BaseAAAccount, Txn, UserOperationV06, WaitParams } from '../types';

import { KernelClient } from './common';

interface ZerodevBaseAAAccountParams {
  client: KernelClient;
}

export abstract class BaseZerodevAAAccount implements BaseAAAccount {
  aaAddress: `0x${string}`;

  protected client: KernelClient;

  protected constructor({ client }: ZerodevBaseAAAccountParams) {
    this.client = client;
    this.aaAddress = client.account.address;
  }

  async buildUserOp(txns: Txn[]): Promise<UserOperationV06> {
    return this.client.signUserOperation({
      userOperation: {
        callData: await this.client.account.encodeCallData(txns),
      },
    });
  }

  async sendUserOp(userOp: UserOperationV06): Promise<Hash> {
    // this.client.sendUserOperation destroys paymasterAndData field, so
    // we have to manually sign and send userOp via bundler api
    const signedUserOp = {
      ...userOp,
      signature: await this.client.account.signUserOperation(userOp),
    };
    const bundlerClient = this.client.extend(bundlerActions(ENTRYPOINT_ADDRESS_V06));
    return bundlerClient.sendUserOperation({ userOperation: signedUserOp });
  }

  async sendTxns(txns: Txn[]): Promise<Hash> {
    const userOp = await this.buildUserOp(txns);
    return this.sendUserOp(userOp);
  }

  async waitForUserOp(userOpHash: Hash, params?: WaitParams | undefined): Promise<void> {
    const bundlerClient = this.client.extend(bundlerActions(ENTRYPOINT_ADDRESS_V06));
    await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
      pollingInterval: params?.pollingIntervalMS,
      timeout: params?.maxDurationMS,
    });
  }
}
