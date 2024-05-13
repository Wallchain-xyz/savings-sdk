import { faker } from '@faker-js/faker';
import { tokenAddresses } from '@zerodev/defi';
import { PrivateKeyAccount, parseAbi, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAccountHasWETHTokenAndGas } from '../../testSuite/defiHelpers';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

type BaseToken = keyof (typeof tokenAddresses)[8453];

describe('Allowance', () => {
  let eoaAccount: PrivateKeyAccount;
  let anotherAccount: PrivateKeyAccount;
  const testClient = createExtendedTestClient();

  beforeAll(async () => {
    await ensurePaymasterIsReady();
    await ensureBundlerIsReady();
    await ensureAnvilIsReady();
  }, 1000);

  beforeEach(() => {
    // TODO: Make random, or fetch from anvil. Currently @1 on anvil
    eoaAccount = privateKeyToAccount(faker.string.hexadecimal({ length: 64 }) as `0x${string}`);
    anotherAccount = privateKeyToAccount(faker.string.hexadecimal({ length: 64 }) as `0x${string}`);

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
  const tokens: BaseToken[] = ['WETH'];

  tokens
    .map(tokenName => ({
      tokenName,
      tokenAddress: tokenAddresses[base.id][tokenName],
    }))
    .map(({ tokenName, tokenAddress }) =>
      it(`Can issue allowance properly for '${tokenName}'`, async () => {
        // Setup
        // TODO: Make random, or fetch from anvil. Currently @2 on anvil

        // Act: send some funds via transferFrom
        await expect(
          testClient.simulateContract({
            account: anotherAccount,
            address: tokenAddress,
            functionName: 'transferFrom',
            abi: parseAbi([
              'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
            ]),
            args: [eoaAccount.address, anotherAccount.address, BigInt(1)],
          }),
        ).rejects.toThrow();

        await ensureAccountHasWETHTokenAndGas({
          client: testClient,
          account: eoaAccount,
        });

        // Act: approve allowance
        const { request: requestApprove } = await testClient.simulateContract({
          account: eoaAccount,
          address: tokenAddress,
          functionName: 'approve',
          abi: parseAbi(['function approve(address spender, uint256 amount) external returns (bool)']),
          args: [anotherAccount.address, BigInt(1)],
        });
        await testClient.writeContract(requestApprove);

        // Act: persist writes
        await testClient.mine({ blocks: 1 });

        // Act: check allowance is persisted
        await testClient
          .readContract({
            address: tokenAddress,
            functionName: 'allowance',
            abi: parseAbi(['function allowance(address owner, address spender) external view returns (uint256)']),
            args: [eoaAccount.address, anotherAccount.address],
          })
          .then(result => {
            expect(result).toBe(BigInt(1));
          });

        // Act: send some funds via transferFrom and expect no funds
        await expect(
          testClient.simulateContract({
            account: anotherAccount,
            address: tokenAddress,
            functionName: 'transferFrom',
            abi: parseAbi([
              'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
            ]),
            args: [eoaAccount.address, anotherAccount.address, BigInt(1)],
          }),
        ).resolves.toBeTruthy();
      }),
    );
});
