import { Account, Address } from 'viem';

import { ExtendedRealClient } from '../createExtendedRealClient';
import { ExtendedTestClient } from '../createExtendedTestClient';

import { getAllowance } from './getAllowance';
import { setAllowance } from './setAllowance';

export interface EnsureAllowanceParams {
  account: Account;
  tokenAddress: Address;
  spenderAddress: Address;
  amount: bigint;
  amountToSet?: bigint;
}

export async function ensureAllowance(
  client: ExtendedTestClient | ExtendedRealClient,
  { account, tokenAddress, spenderAddress, amount, amountToSet }: EnsureAllowanceParams,
) {
  const currentAllowance = await getAllowance(client, { tokenAddress, ownerAddress: account.address, spenderAddress });
  if (currentAllowance >= amount) {
    return;
  }
  // Set to zero, as some tokens do not allow to change non-zero allowance
  await setAllowance(client, { account, tokenAddress, spenderAddress, amount: 0n });
  await setAllowance(client, { account, tokenAddress, spenderAddress, amount: amountToSet ?? amount });
}
