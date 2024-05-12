import { Abi, encodeFunctionData } from 'viem';

import type { Permission } from '@zerodev/session-key';

interface CreateNativeAddDepositTxnParams {
  addDepositPermission: Permission<Abi, string>;
  amount: bigint;
}

export function createNativeAddDepositTxn({ addDepositPermission, amount }: CreateNativeAddDepositTxnParams) {
  return {
    to: addDepositPermission.target,
    value: amount,
    data: encodeFunctionData({
      // @ts-expect-error @merlin to fix
      abi: addDepositPermission.abi,
      functionName: addDepositPermission.functionName,
    }),
  };
}
