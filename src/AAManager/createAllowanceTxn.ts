import { Address, encodeFunctionData } from 'viem';

export const ERC_20_ALLOWANCE_FUNCTION_NAME = 'approve';

export interface AllowanceParams {
  amount: bigint;
  token: Address;
  owner: Address;
  spender: Address;
}

export function createAllowanceTxn({ token, spender, amount, owner }: AllowanceParams) {
  return {
    data: encodeFunctionData({
      functionName: ERC_20_ALLOWANCE_FUNCTION_NAME,
      abi: [
        {
          name: 'approve',
          type: 'function',
          inputs: [
            {
              type: 'address',
              name: 'spender',
            },
            {
              type: 'uint256',
              name: 'value',
            },
          ],
        },
      ],
      args: [spender, amount],
    }),
    value: BigInt(0),
    from: owner,
    to: token,
  };
}
