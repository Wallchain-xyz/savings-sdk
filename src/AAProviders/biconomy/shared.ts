import { UserOperationStruct } from '@biconomy/account';
import { Address, getAbiItem, toFunctionSelector, toHex } from 'viem';

import { Permission } from '../shared/Permission';
import { UserOperationV06 } from '../shared/UserOperationV06';

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

export function ensureHex(value: Hex | string | number | bigint | boolean | ByteArray): Hex {
  // toHex re-encodes strings that aare already hex, so we need this wrapper to preserve them
  if (typeof value === 'string' && value.startsWith('0x')) {
    return value as Hex;
  }
  return toHex(value);
}

export function biconomyUserOpStructToUserOp(userOp: Partial<UserOperationStruct>): UserOperationV06 {
  return {
    sender: userOp.sender as Address,
    nonce: BigInt(userOp.nonce ?? 0),
    initCode: ensureHex(userOp.initCode ?? '0x'),
    callData: ensureHex(userOp.callData ?? '0x'),
    callGasLimit: BigInt(userOp.callGasLimit ?? 0),
    verificationGasLimit: BigInt(userOp.verificationGasLimit ?? 0),
    preVerificationGas: BigInt(userOp.preVerificationGas ?? 0),
    maxFeePerGas: BigInt(userOp.maxFeePerGas ?? 0),
    maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas ?? 0),
    paymasterAndData: ensureHex(userOp.paymasterAndData ?? '0x'),
    signature: ensureHex(userOp.signature ?? '0x'),
  };
}

export function userOpToBiconomyUserOpStruct(userOp: UserOperationV06): UserOperationStruct {
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

export function permissionToSelector({ abi, functionName }: Pick<Permission, 'abi' | 'functionName'>): Hex {
  const functionAbi = getAbiItem({ abi, name: functionName });
  if (!functionAbi || functionAbi.type !== 'function') {
    throw new Error(`Invalid abi in permission ${functionName}`);
  }
  return toFunctionSelector(functionAbi);
}
