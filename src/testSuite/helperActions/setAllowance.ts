import { Account, Address, encodeFunctionData, parseAbi } from 'viem';

import { ExtendedRealClient } from '../createExtendedRealClient';
import { ExtendedTestClient } from '../createExtendedTestClient';

export interface SetAllowanceParams {
  account: Account;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: bigint;
}

export async function setAllowance(
  client: ExtendedTestClient | ExtendedRealClient,
  { account, tokenAddress, spenderAddress, amount }: SetAllowanceParams,
) {
  const txnHash = await client.sendTransaction({
    account,
    to: tokenAddress,
    value: 0n,
    data: encodeFunctionData({
      abi: parseAbi(['function approve(address spender, uint256 amount) external returns (bool)']),
      functionName: 'approve',
      args: [spenderAddress, amount],
    }),
  });
  const response = await client.waitForTransactionReceipt({ hash: txnHash });
  if (response.status !== 'success') {
    throw new Error('Can not give allowance');
  }
}
