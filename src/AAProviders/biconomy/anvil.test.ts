import { faker } from '@faker-js/faker';
import { PrivateKeyAccount, getAddress, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { getHttpRpcClient } from 'viem/utils';

import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady } from '../../testSuite/healthCheck';

import { BiconomyAAProvider } from './provider';

describe('Biconomy Provider Local Anvil', () => {
  let eoaAccount: PrivateKeyAccount;
  let skaAccount: PrivateKeyAccount;
  const testClient = createExtendedTestClient();
  const provider: BiconomyAAProvider = new BiconomyAAProvider({
    chain: testClient.chain,
    rpcUrl: 'http://localhost:8545',
    bundlerUrl: 'http://localhost:4337',
    bundlerType: 'pimlico',
  });

  beforeAll(async () => {
    await ensureBundlerIsReady();
    await ensureAnvilIsReady();
  }, 10_000);

  beforeEach(async () => {
    eoaAccount = privateKeyToAccount(faker.string.hexadecimal({ length: 64 }) as `0x${string}`);
    skaAccount = privateKeyToAccount(faker.string.hexadecimal({ length: 64 }) as `0x${string}`);

    await testClient.reset();
    await getHttpRpcClient('http://localhost:4337').request({
      body: {
        method: 'debug_bundler_clearState',
      },
    });

    await testClient.setBalance({
      address: eoaAccount.address,
      value: parseEther('42'),
    });
    await testClient.setBalance({
      address: skaAccount.address,
      value: parseEther('42'),
    });
  }, 10_000);

  it('send simple txn', async () => {
    // Arrange
    const aaAccount = await provider.createAAAccount(eoaAccount);
    await testClient.setBalance({
      address: aaAccount.aaAddress,
      value: parseEther('42'),
    });
    const receiver = getAddress(faker.string.hexadecimal({ length: 40 }));

    // Act
    const userOpHash = await aaAccount.sendTxns([
      {
        to: receiver,
        value: 123n,
        data: '0x',
      },
    ]);
    await aaAccount.waitForUserOp(userOpHash);

    // Assert
    const receiverBalance = await testClient.getBalance({
      address: receiver,
    });
    expect(receiverBalance).toBe(123n);
  }, 100_000);
});
