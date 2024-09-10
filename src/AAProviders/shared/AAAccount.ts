import { Address, Hash } from 'viem';

import { Paymaster } from './Paymaster';
import { Txn } from './Txn';
import { UserOperationV06 } from './UserOperationV06';

export interface WaitParams {
  maxDurationMS: number;
  pollingIntervalMS: number;
}

export interface UserOpResult {
  txnHash: Hash | undefined;
  success: boolean;
}

export abstract class AAAccount {
  abstract readonly aaAddress: Address;

  private paymaster?: Paymaster;

  protected waitParams: WaitParams = { maxDurationMS: 30000, pollingIntervalMS: 500 };

  abstract buildUserOp(txns: Txn[]): Promise<UserOperationV06>;

  abstract sendUserOp(userOp: UserOperationV06): Promise<Hash>;

  abstract waitForUserOp(userOpHash: Hash, params?: WaitParams): Promise<UserOpResult>;

  setPaymaster(paymaster: Paymaster) {
    this.paymaster = paymaster;
  }

  setDefaultWaitParams(params: WaitParams) {
    this.waitParams = params;
  }

  async sendTxns(txns: Txn[]): Promise<Hash | undefined> {
    if (txns.length === 0) {
      return undefined;
    }
    let userOp = await this.buildUserOp(txns);
    if (this.paymaster) {
      userOp = await this.paymaster.addPaymasterIntoUserOp(userOp);
    }
    return this.sendUserOp(userOp);
  }

  async sendTxnsAndWait(txns: Txn[], params?: WaitParams | undefined): Promise<UserOpResult> {
    const userOpHash = await this.sendTxns(txns);
    if (userOpHash === undefined) {
      return {
        success: true,
        txnHash: undefined,
      };
    }
    return this.waitForUserOp(userOpHash, params);
  }
}
