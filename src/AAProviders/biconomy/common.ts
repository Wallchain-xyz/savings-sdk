import { UserOperationStruct } from '@biconomy/account';
import { Address, toHex } from 'viem';

import { UserOperationV06 } from '../types';

import type { ByteArray, Hex } from 'viem/types/misc';

export const abiSVMAddress: Address = '0x000006bC2eCdAe38113929293d241Cf252D91861';

export interface SessionIdMap {
  [key: string]: string;
}

export interface BiconomySKAData {
  storageData: string;
  eoaOwnerAddress: Address;
  aaAddress: Address;
  sessionIdMap: SessionIdMap;
}

export function ensureHex(value: string | number | bigint | boolean | ByteArray): Hex {
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value as Hex;
  }
  return toHex(value);
}

export function normalizeUserOp(userOp: Partial<UserOperationStruct>): UserOperationV06 {
  return {
    sender: userOp.sender as Address,
    nonce: BigInt(userOp.nonce || 0),
    initCode: ensureHex(userOp.initCode || '0x'),
    callData: ensureHex(userOp.callData || '0x'),
    callGasLimit: BigInt(userOp.callGasLimit || 0),
    verificationGasLimit: BigInt(userOp.verificationGasLimit || 0),
    preVerificationGas: BigInt(userOp.preVerificationGas || 0),
    maxFeePerGas: BigInt(userOp.maxFeePerGas || 1),
    maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas || 1),
    paymasterAndData: ensureHex(userOp.paymasterAndData || '0x'),
    signature: ensureHex(userOp.signature || '0x'),
  };
}

export function denormalizeUserOp(userOp: UserOperationV06): UserOperationStruct {
  return {
    ...userOp,
    nonce: ensureHex(userOp.nonce),
    callGasLimit: ensureHex(userOp.callGasLimit),
    verificationGasLimit: ensureHex(userOp.verificationGasLimit),
    preVerificationGas: ensureHex(userOp.preVerificationGas),
    maxFeePerGas: ensureHex(userOp.maxFeePerGas),
    maxPriorityFeePerGas: ensureHex(userOp.maxPriorityFeePerGas),
  };
}
