import { Address, encodeFunctionData, parseAbi } from 'viem';

export const ERC20_ALLOWANCE_FUNCTION_NAME = 'approve';

export interface AllowanceParams {
  amount: bigint;
  token: Address;
  owner: Address;
  spender: Address;
}

export function createAllowanceTxn({ token, spender, amount, owner }: AllowanceParams) {
  return {
    data: encodeFunctionData({
      functionName: ERC20_ALLOWANCE_FUNCTION_NAME,
      abi: parseAbi(['function approve(address spender, uint256 amount) external returns (bool)']),
      args: [spender, amount],
    }),
    value: BigInt(0),
    from: owner,
    to: token,
  };
}
