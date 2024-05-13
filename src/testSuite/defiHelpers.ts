/* eslint-disable import/no-extraneous-dependencies */
import { tokenAddresses } from '@zerodev/defi';
import { LocalAccount, PrivateKeyAccount, parseAbi, parseEther } from 'viem';
import { base } from 'viem/chains';

import { ExtendedTestClient } from './createExtendedTestClient';

// TODO: Support not only `base` chain

export async function ensureAccountHasWETHTokenAndGas({
  client,
  account,
  shouldMine, // Disabling can speed up test if mine is not necessary. Use with care
}: {
  client: ExtendedTestClient;
  account: LocalAccount | PrivateKeyAccount;
  shouldMine?: boolean;
}) {
  await client.setBalance({
    address: account.address,
    value: parseEther('100'),
  });

  const { request: requestDeposit } = await client.simulateContract({
    account,
    address: tokenAddresses[base.id].WETH,
    functionName: 'deposit',
    abi: parseAbi(['function deposit() public payable']),
    args: [],
    value: parseEther('40'),
  });
  await client.writeContract(requestDeposit);

  if (shouldMine === undefined || shouldMine === true) {
    await client.mine({ blocks: 1 });
  }
}
