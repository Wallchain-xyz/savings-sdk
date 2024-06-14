import { Address, parseAbi } from 'viem';

import { ExtendedRealClient } from '../createExtendedRealClient';
import { ExtendedTestClient } from '../createExtendedTestClient';

export interface GetERC20BalanceParams {
  tokenAddress: Address;
  accountAddress: Address;
}

export async function getERC20Balance(
  client: ExtendedTestClient | ExtendedRealClient,
  { tokenAddress, accountAddress }: GetERC20BalanceParams,
) {
  return client.readContract({
    address: tokenAddress,
    abi: parseAbi(['function balanceOf(address owner) view returns (uint256)']),
    functionName: 'balanceOf',
    args: [accountAddress],
  });
}
