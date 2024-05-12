import { Address, encodeFunctionData, parseAbi } from 'viem';

interface CreateRequestAllowanceTxnParams {
  owner: Address;
  token: Address;
  spender: Address;
}

export function createRequestAllowanceTxn({ owner, token, spender }: CreateRequestAllowanceTxnParams) {
  return {
    method: 'eth_call',
    params: [
      {
        from: owner,
        to: token,
        data: encodeFunctionData({
          abi: parseAbi(['function allowance(address owner, address spender) external view returns (uint256)']),
          args: [owner, spender],
        }),
        value: '0x0',
      },
      'latest',
    ],
  };
}
