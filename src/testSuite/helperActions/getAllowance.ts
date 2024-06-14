import { Address, parseAbi } from 'viem';

import { ExtendedRealClient } from '../createExtendedRealClient';
import { ExtendedTestClient } from '../createExtendedTestClient';

export interface GetAllowanceParams {
  tokenAddress: Address;
  ownerAddress: Address;
  spenderAddress: Address;
}

export async function getAllowance(
  client: ExtendedTestClient | ExtendedRealClient,
  { tokenAddress, ownerAddress, spenderAddress }: GetAllowanceParams,
) {
  return client.readContract({
    address: tokenAddress,
    abi: parseAbi(['function allowance(address owner, address spender) external view returns (uint256)']),
    functionName: 'allowance',
    args: [ownerAddress, spenderAddress],
  });
}
