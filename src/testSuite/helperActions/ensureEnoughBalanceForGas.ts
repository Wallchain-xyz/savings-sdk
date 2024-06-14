import { Address, parseEther } from 'viem';

import { ExtendedTestClient } from '../createExtendedTestClient';

export interface EnsureEnoughBalanceForGasParams {
  address: Address;
}

export async function ensureEnoughBalanceForGas(
  client: ExtendedTestClient,
  { address }: EnsureEnoughBalanceForGasParams,
) {
  await client.setBalance({
    address,
    value: parseEther('42'),
  });
}
