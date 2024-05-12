import { Permission } from '@zerodev/session-key';
import { Abi, encodeFunctionData } from 'viem';

interface CreateERC20AddDepositTxnParams {
  addDepositPermission: Permission<Abi, string>;
  amount: bigint;
}

export function createERC20AddDepositTxn({ addDepositPermission, amount }: CreateERC20AddDepositTxnParams) {
  return {
    to: addDepositPermission.target,
    value: BigInt(0),
    data: encodeFunctionData({
      // @ts-expect-error @merlin to fix
      abi: addDepositPermission.abi,
      functionName: addDepositPermission.functionName,
      args: [amount],
    }),
  };
}
