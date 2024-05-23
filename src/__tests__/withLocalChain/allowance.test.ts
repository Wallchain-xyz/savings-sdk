import { tokenAddresses } from '@zerodev/defi';
import { PrivateKeyAccount, parseAbi, parseEther } from 'viem';
import { base } from 'viem/chains';

import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAccountHasTokenAndGas } from '../../testSuite/defiHelpers';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';
import { createEoaAccount } from '../utils/createEoaAccount';

type BaseTokenName = keyof (typeof tokenAddresses)[8453];

const transferFromAbi = parseAbi([
  'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
]);
const approveAbi = parseAbi(['function approve(address spender, uint256 amount) external returns (bool)']);

describe('allowance', () => {
  let eoaAccount: PrivateKeyAccount;
  let anotherAccount: PrivateKeyAccount;
  const testClient = createExtendedTestClient();

  beforeAll(async () => {
    await Promise.all([ensurePaymasterIsReady(), ensureBundlerIsReady(), ensureAnvilIsReady()]);
  }, 10_000);

  beforeEach(() => {
    eoaAccount = createEoaAccount();
    anotherAccount = createEoaAccount();

    testClient.setBalance({
      address: eoaAccount.address,
      value: parseEther('42'),
    });
    testClient.setBalance({
      address: anotherAccount.address,
      value: parseEther('42'),
    });
  });

  // TODO: Add more tokens by implementing swaps in helpers
  // TODO: Add USDT verification for increased allowance (e.g. allowance should
  // be reset to 0 in meantime), will FAIL

  it.each([['WETH' as BaseTokenName]])('can issue allowance properly for %s', async tokenName => {
    const tokenAddress = tokenAddresses[base.id][tokenName];
    // Setup

    // Act: send some funds via transferFrom
    await expect(
      testClient.simulateContract({
        account: anotherAccount,
        address: tokenAddress,
        functionName: 'transferFrom',
        abi: transferFromAbi,
        args: [eoaAccount.address, anotherAccount.address, BigInt(1)],
      }),
    ).rejects.toThrow();

    await ensureAccountHasTokenAndGas({
      tokenAddress,
      client: testClient,
      account: eoaAccount,
    });

    // Act: approve allowance
    const { request: requestApprove } = await testClient.simulateContract({
      account: eoaAccount,
      address: tokenAddress,
      functionName: 'approve',
      abi: approveAbi,
      args: [anotherAccount.address, BigInt(1)],
    });
    await testClient.writeContract(requestApprove);

    // Act: persist writes
    await testClient.mine({ blocks: 1 });

    // Act: check allowance is persisted
    await expect(
      testClient.readContract({
        address: tokenAddress,
        functionName: 'allowance',
        abi: parseAbi(['function allowance(address owner, address spender) external view returns (uint256)']),
        args: [eoaAccount.address, anotherAccount.address],
      }),
    ).resolves.toBe(BigInt(1));

    // Act: send some funds via transferFrom and expect no funds
    await expect(
      testClient.simulateContract({
        account: anotherAccount,
        address: tokenAddress,
        functionName: 'transferFrom',
        abi: transferFromAbi,
        args: [eoaAccount.address, anotherAccount.address, BigInt(1)],
      }),
    ).resolves.toBeTruthy();
  });
});
