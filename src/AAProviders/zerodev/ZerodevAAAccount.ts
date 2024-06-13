import { BundlerClient, ENTRYPOINT_ADDRESS_V06, bundlerActions } from 'permissionless';

import { Address, Hash } from 'viem';

import { AAAccount, UserOpResult, WaitParams } from '../shared/AAAccount';
import { Txn } from '../shared/Txn';
import { UserOperationV06 } from '../shared/UserOperationV06';

import { KernelClient } from './shared';

export interface ZerodevAAAccountParams {
  client: KernelClient;
}

export abstract class ZerodevAAAccount extends AAAccount {
  protected client: KernelClient;

  private bundlerClient: BundlerClient<typeof ENTRYPOINT_ADDRESS_V06>;

  get aaAddress(): Address {
    return this.client.account.address;
  }

  protected constructor({ client }: ZerodevAAAccountParams) {
    super();
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
    const signedUserOp = {
      ...userOp,
      signature: await this.client.account.signUserOperation(userOp),
    };
    // this.client.sendUserOperation destroys paymasterAndData field, so
    // we have to manually sign and send userOp via bundler api
    return this.bundlerClient.sendUserOperation({ userOperation: signedUserOp });
  }

  async waitForUserOp(userOpHash: Hash, params?: WaitParams | undefined): Promise<UserOpResult> {
    const receipt = await this.bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
      pollingInterval: params?.pollingIntervalMS,
      timeout: params?.maxDurationMS,
    });
    return {
      txnHash: receipt.receipt.transactionHash,
      success: receipt.success && receipt.receipt.status === 'success',
    };
  }
}
