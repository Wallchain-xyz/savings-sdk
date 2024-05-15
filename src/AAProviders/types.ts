import { Address, Hash, Hex, PrivateKeyAccount } from 'viem';

import type { AbiFunction } from 'abitype';

export interface Txn {
  to: Address;
  data: Hex;
  value: bigint;
}

interface PermissionRule {
  operator: 'equal';
  value: Hex;
}

export interface Permission {
  target: Address;
  functionName: string;
  valueLimit: bigint;
  abi: AbiFunction;
  rules: PermissionRule[];
}

export interface UserOperationV06 {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Hex;
  signature: Hex;
}

export interface WaitParams {
  maxDurationMS?: number;
  pollingIntervalMS: number;
}

export interface BaseAAAccount {
  aaAddress: Address;
  buildUserOp: (txns: Txn[]) => Promise<UserOperationV06>;
  sendUserOp: (userOp: UserOperationV06) => Promise<Hash>;
  sendTxns: (txns: Txn[]) => Promise<Hash>;
  waitForUserOp: (userOpHash: Hash, params?: WaitParams) => Promise<void>;
}

export interface SKAccount extends BaseAAAccount {}

export type SerializedSKAData = string;

export interface CreateSKAResult {
  serializedSKAData: SerializedSKAData;
  txnsToActivate: Txn[];
}

export interface AAAccount extends BaseAAAccount {
  createSessionKey: (skaAddress: Address, permissions: Permission[]) => Promise<CreateSKAResult>;
}

export interface AAProvider {
  createAAAccount: (signer: PrivateKeyAccount) => Promise<AAAccount>;
  createSKAccount: (skaSigner: PrivateKeyAccount, serializedSKAData: SerializedSKAData) => Promise<SKAccount>;
}

export interface Paymaster {
  addPaymasterIntoUserOp: (userOp: UserOperationV06) => Promise<UserOperationV06>;
}
