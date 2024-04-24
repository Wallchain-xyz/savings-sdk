import { Address, encodeFunctionData } from 'viem';

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
          functionName: 'allowance',
          abi: [
            {
              name: 'allowance',
              type: 'function',
              inputs: [
                {
                  type: 'address',
                  name: 'from',
                },
                {
                  type: 'address',
                  name: 'to',
                },
              ],
            },
          ],
          args: [owner, spender],
        }),
        value: '0x0',
      },
      'latest',
    ],
  };
}
