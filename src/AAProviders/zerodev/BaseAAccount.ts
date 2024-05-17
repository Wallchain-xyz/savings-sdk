import { BundlerClient, ENTRYPOINT_ADDRESS_V06, bundlerActions } from 'permissionless';
import { Address, Hash } from 'viem';

import { BaseAAAccount, Txn, UserOperationV06, WaitParams } from '../types';

import { KernelClient } from './common';

export interface BaseZerodevAAAccountParams {
  client: KernelClient;
}

export abstract class BaseZerodevAAAccount implements BaseAAAccount {
  protected client: KernelClient;

  private bundlerClient: BundlerClient<typeof ENTRYPOINT_ADDRESS_V06>;

  get aaAddress(): Address {
    return this.client.account.address;
  }

  protected constructor({ client }: BaseZerodevAAAccountParams) {
    this.client = client;
    this.bundlerClient = this.client.extend(bundlerActions(ENTRYPOINT_ADDRESS_V06));
  }

  async buildUserOp(txns: Txn[]): Promise<UserOperationV06> {
    return this.client.prepareUserOperationRequest({
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
    return this.bundlerClient.sendUserOperation({ userOperation: signedUserOp });
  }

  async sendTxns(txns: Txn[]): Promise<Hash> {
    const userOp = await this.buildUserOp(txns);
    return this.sendUserOp(userOp);
  }

  async waitForUserOp(userOpHash: Hash, params?: WaitParams | undefined): Promise<void> {
    await this.bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
      pollingInterval: params?.pollingIntervalMS,
      timeout: params?.maxDurationMS,
    });
  }
}
