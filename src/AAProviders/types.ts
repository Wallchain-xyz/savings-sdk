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

export interface WaitParams {
  maxDurationMS?: number;
  pollingIntervalMS: number;
}

export interface BaseAAAccount {
  aaAddress: Address;
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
