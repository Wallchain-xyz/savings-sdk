/* eslint-disable import/no-extraneous-dependencies */
import { tokenAddresses } from '@zerodev/defi';
import { LocalAccount, PrivateKeyAccount, TestClient, parseAbi, parseEther, publicActions, walletActions } from 'viem';
import { base } from 'viem/chains';

// TODO: Support not only `base` chain

export async function ensureAccountHasWETHTokenAndGas({
  testClient,
  account,
  shouldMine, // Disabling can speed up test if mine is not necessary. Use with care
}: {
  testClient: TestClient;
  account: LocalAccount | PrivateKeyAccount;
  shouldMine?: boolean;
}) {
  // TODO: Remove this, if one can figure out expected typing in TestClient.
  const client = testClient.extend(publicActions).extend(walletActions);

  client.setBalance({
    address: account.address,
    value: parseEther('100'),
  });

  const { request: requestDeposit } = await testClient.simulateContract({
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
