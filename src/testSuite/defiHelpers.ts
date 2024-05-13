import { Address, LocalAccount, PrivateKeyAccount, parseAbi, parseEther } from 'viem';

import { ExtendedTestClient } from './createExtendedTestClient';

// TODO: Support not only `base` chain

export async function ensureAccountHasTokenAndGas({
  tokenAddress,
  client,
  account,
  shouldMine, // Disabling can speed up test if mine is not necessary. Use with care
}: {
  tokenAddress: Address;
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
    address: tokenAddress,
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
