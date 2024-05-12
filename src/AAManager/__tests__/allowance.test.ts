import { faker } from '@faker-js/faker';
import { tokenAddresses } from '@zerodev/defi';
import { PrivateKeyAccount, createTestClient, http, parseAbi, parseEther, publicActions, walletActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';

import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

describe('Allowance', () => {
  let eoaAccount: PrivateKeyAccount;
  let anotherAccount: PrivateKeyAccount;
  const testClient = createTestClient({
    chain: base,
    mode: 'anvil',
    transport: http('http://localhost:8545'),
  })
    .extend(publicActions)
    .extend(walletActions);

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
  ['WETH']
    .map((tokenName: string) => ({
      tokenName,
      tokenAddress: tokenAddresses[base.id][tokenName],
    }))
    .map(({ tokenName, tokenAddress }) =>
      test(`Can issue allowance properly for '${tokenName}'`, async () => {
        // Setup
        // TODO: Make random, or fetch from anvil. Currently @2 on anvil

        // Act: send some funds via transferFrom
        expect(async () => {
          await testClient.simulateContract({
            account: anotherAccount,
            address: tokenAddress,
            functionName: 'transferFrom',
            abi: parseAbi([
              'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
            ]),
            args: [eoaAccount.address, anotherAccount.address, BigInt(1)],
          });
        }).rejects.toThrowError();

        // Act: deposit allowance
        const { request: requestDeposit } = await testClient.simulateContract({
          account: eoaAccount,
          address: tokenAddress,
          functionName: 'deposit',
          abi: parseAbi(['function deposit() public payable']),
          args: [],
          value: BigInt(10),
        });
        await testClient.writeContract(requestDeposit);

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
        expect(
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
