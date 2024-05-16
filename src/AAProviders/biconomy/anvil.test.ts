import { faker } from '@faker-js/faker';
import { PrivateKeyAccount, getAddress, parseEther } from 'viem';

import { createEoaAccount } from '../../__tests__/utils/createEoaAccount';
import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady } from '../../testSuite/healthCheck';

import { PimlicoPaymaster } from '../pimlico/paymaster';

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
  const paymaster = new PimlicoPaymaster('http://localhost:4330');

  beforeAll(async () => {
    await Promise.all([ensureBundlerIsReady(), ensureAnvilIsReady()]);
  }, 10_000);

  beforeEach(async () => {
    eoaAccount = createEoaAccount();
    skaAccount = createEoaAccount();

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

  it('send simple txn with paymaster', async () => {
    // Arrange
    const aaAccount = await provider.createAAAccount(eoaAccount);
    await testClient.setBalance({
      address: aaAccount.aaAddress,
      value: parseEther('42'),
    });
    const receiver = getAddress(faker.string.hexadecimal({ length: 40 }));
    const balanceBefore = await testClient.getBalance({ address: aaAccount.aaAddress });

    // Act
    let userOp = await aaAccount.buildUserOp([
      {
        to: receiver,
        value: 123n,
        data: '0x',
      },
    ]);
    userOp = await paymaster.addPaymasterIntoUserOp(userOp);
    const userOpHash = await aaAccount.sendUserOp(userOp);
    await aaAccount.waitForUserOp(userOpHash);

    // Assert
    const receiverBalance = await testClient.getBalance({
      address: receiver,
    });
    expect(receiverBalance).toBe(123n);
    const balanceAfter = await testClient.getBalance({ address: aaAccount.aaAddress });
    expect(balanceBefore - balanceAfter).toBe(123n);
  }, 100_000);
});
