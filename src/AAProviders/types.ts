import { Abi, Address, Hash, Hex, PrivateKeyAccount } from 'viem';

export interface Txn {
  to: Address;
  data: Hex;
  value: bigint;
}

export enum PermissionArgOperator {
  EQUAL = 0,
  GREATER_THAN = 1,
  LESS_THAN = 2,
  GREATER_THAN_OR_EQUAL = 3,
  LESS_THAN_OR_EQUAL = 4,
  NOT_EQUAL = 5,
}

interface PermissionArgRule {
  operator: PermissionArgOperator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface Permission {
  target: Address;
  functionName: string;
  valueLimit: bigint;
  abi: Abi;
  args: PermissionArgRule[];
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

export interface UserOpResult {
  txnHash: Hash;
  success: boolean;
}

export interface BaseAAAccount {
  readonly aaAddress: Address;
  buildUserOp: (txns: Txn[]) => Promise<UserOperationV06>;
  sendUserOp: (userOp: UserOperationV06) => Promise<Hash>;
  sendTxns: (txns: Txn[]) => Promise<Hash>;
  waitForUserOp: (userOpHash: Hash, params?: WaitParams) => Promise<UserOpResult>;
}

export interface SKAccount extends BaseAAAccount {}

export type SerializedSKAData = string;

export interface CreateSKAResult {
  serializedSKAData: SerializedSKAData;
  txnsToActivate: Txn[];
}

export interface CreateSessionKeyParams {
  skaAddress: Address;
  permissions: Permission[];
}

export interface AAAccount extends BaseAAAccount {
  createSessionKey: (params: CreateSessionKeyParams) => Promise<CreateSKAResult>;
}

export interface AAProvider {
  createAAAccount: (signer: PrivateKeyAccount) => Promise<AAAccount>;
  createSKAccount: (skaSigner: PrivateKeyAccount, serializedSKAData: SerializedSKAData) => Promise<SKAccount>;
}

export interface Paymaster {
  addPaymasterIntoUserOp: (userOp: UserOperationV06) => Promise<UserOperationV06>;
}
