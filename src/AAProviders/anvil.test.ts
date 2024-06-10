import { faker } from '@faker-js/faker';
import { Chain, PrivateKeyAccount, encodeFunctionData, getAddress, getContract, parseAbi, parseEther } from 'viem';

import { createEoaAccount } from '../__tests__/utils/createEoaAccount';
import { createExtendedTestClient } from '../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../testSuite/healthCheck';

import { BiconomyAAProvider } from './biconomy/BiconomyAAProvider';
import { PimlicoPaymaster } from './pimlico/PimlicoPaymaster';

import { AAProvider } from './shared/AAProvider';
import { BundlerType } from './shared/BundlerType';
import { PermissionArgOperator } from './shared/Permission';
import { ZerodevAAProvider } from './zerodev/ZerodevAAProvider';

describe.each([
  [
    'zerodev',
    (chain: Chain) =>
      new ZerodevAAProvider({
        chain,
        rpcUrl: 'http://localhost:8545',
        bundlerUrl: 'http://localhost:4337',
      }),
  ],
  [
    'biconomy',
    (chain: Chain) =>
      new BiconomyAAProvider({
        chain,
        rpcUrl: 'http://localhost:8545',
        bundlerUrl: 'http://localhost:4337',
        bundlerType: BundlerType.pimlico,
      }),
  ],
])('Provider %s Local Anvil', (_: string, providerFactory: (chain: Chain) => AAProvider) => {
  let eoaAccount: PrivateKeyAccount;
  let skaAccount: PrivateKeyAccount;
  const testClient = createExtendedTestClient();
  const provider: AAProvider = providerFactory(testClient.chain);
  const paymaster = new PimlicoPaymaster('http://localhost:4330');

  const wethContract = getContract({
    address: '0x4200000000000000000000000000000000000006',
    abi: parseAbi([
      'function deposit() public payable',
      'function withdraw(uint wad) public',
      'function balanceOf(address owner) view returns (uint256)',
    ]),
    client: testClient,
  });

  beforeAll(async () => {
    await ensureBundlerIsReady();
    await ensureAnvilIsReady();
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
    const amount = faker.number.bigInt({ min: 1n, max: 200n });

    // Act
    const userOpHash = await aaAccount.sendTxns([
      {
        to: receiver,
        value: amount,
        data: '0x',
      },
    ]);
    await aaAccount.waitForUserOp(userOpHash);

    // Assert
    const receiverBalance = await testClient.getBalance({
      address: receiver,
    });
    expect(receiverBalance).toBe(amount);
  }, 30_000);

  describe('with paymaster', () => {
    beforeAll(async () => {
      await ensurePaymasterIsReady();
    }, 10_000);

    it('send simple txn with paymaster', async () => {
      // Arrange
      const aaAccount = await provider.createAAAccount(eoaAccount);
      const amount = faker.number.bigInt({ min: 1n, max: 200n });
      await testClient.setBalance({
        address: aaAccount.aaAddress,
        value: amount,
      });
      const receiver = getAddress(faker.string.hexadecimal({ length: 40 }));

      // Act
      const userOp = await aaAccount.buildUserOp([
        {
          to: receiver,
          value: amount,
          data: '0x',
        },
      ]);
      const sponsoredUserOp = await paymaster.addPaymasterIntoUserOp(userOp);
      const userOpHash = await aaAccount.sendUserOp(sponsoredUserOp);
      await aaAccount.waitForUserOp(userOpHash);

      // Assert
      const receiverBalance = await testClient.getBalance({
        address: receiver,
      });
      expect(receiverBalance).toBe(amount);
      const balanceAfter = await testClient.getBalance({ address: aaAccount.aaAddress });
      expect(balanceAfter).toBe(0n);
    }, 30_000);

    it('should create SKA that can deposit and withdraw', async () => {
      // Arrange
      const aaAccount = await provider.createAAAccount(eoaAccount);
      await testClient.setBalance({
        address: aaAccount.aaAddress,
        value: parseEther('42'),
      });
      const amountDeposit = faker.number.bigInt({ min: 101n, max: 200n });
      const amountWithdraw = faker.number.bigInt({ min: 1n, max: 100n });

      // Act
      const skaData = await aaAccount.createSessionKey({
        skaAddress: skaAccount.address,
        permissions: [
          {
            target: wethContract.address,
            functionName: 'deposit',
            valueLimit: parseEther('100000'),
            abi: wethContract.abi,
            args: [],
          },
          {
            target: wethContract.address,
            functionName: 'withdraw',
            valueLimit: parseEther('0'),
            abi: wethContract.abi,
            args: [
              {
                operator: PermissionArgOperator.EQUAL,
                value: amountWithdraw,
              },
            ],
          },
        ],
      });
      if (skaData.txnsToActivate) {
        const createSKAUserOpHash = await aaAccount.sendTxns(skaData.txnsToActivate);
        await aaAccount.waitForUserOp(createSKAUserOpHash);
      }
      const saAccount = await provider.createSKAccount({
        skaSigner: skaAccount,
        serializedSKAData: skaData.serializedSKAData,
      });
      saAccount.setPaymaster(paymaster);
      const userOpHash = await saAccount.sendTxns([
        {
          to: wethContract.address,
          data: encodeFunctionData({
            abi: wethContract.abi,
            functionName: 'deposit',
            args: [],
          }),
          value: amountDeposit,
        },
        {
          to: wethContract.address,
          data: encodeFunctionData({
            abi: wethContract.abi,
            functionName: 'withdraw',
            args: [amountWithdraw],
          }),
          value: 0n,
        },
      ]);
      await aaAccount.waitForUserOp(userOpHash);

      // Assert
      const wethBalance = await wethContract.read.balanceOf([aaAccount.aaAddress]);
      expect(wethBalance).toBe(amountDeposit - amountWithdraw);
    }, 30_000);
  });

  it('SKA permission are validated', async () => {
    // Arrange
    const aaAccount = await provider.createAAAccount(eoaAccount);
    await testClient.setBalance({
      address: aaAccount.aaAddress,
      value: parseEther('42'),
    });
    const amount = faker.number.bigInt({ min: 101n, max: 200n });
    const userOpHash = await aaAccount.sendTxns([
      {
        to: wethContract.address,
        data: encodeFunctionData({
          abi: wethContract.abi,
          functionName: 'deposit',
          args: [],
        }),
        value: amount,
      },
    ]);
    await aaAccount.waitForUserOp(userOpHash);

    // Act
    const skaData = await aaAccount.createSessionKey({
      skaAddress: skaAccount.address,
      permissions: [
        {
          target: wethContract.address,
          functionName: 'withdraw',
          valueLimit: parseEther('0'),
          abi: wethContract.abi,
          args: [
            {
              operator: PermissionArgOperator.EQUAL,
              value: amount - 1n,
            },
          ],
        },
      ],
    });
    if (skaData.txnsToActivate) {
      const createSKAUserOpHash = await aaAccount.sendTxns(skaData.txnsToActivate);
      await aaAccount.waitForUserOp(createSKAUserOpHash);
    }
    const saAccount = await provider.createSKAccount({
      skaSigner: skaAccount,
      serializedSKAData: skaData.serializedSKAData,
    });
    try {
      const skaUserOpHash = await saAccount.sendTxns([
        {
          to: wethContract.address,
          data: encodeFunctionData({
            abi: wethContract.abi,
            functionName: 'withdraw',
            args: [amount], // this amount should be disallowed
          }),
          value: 0n,
        },
      ]);
      await aaAccount.waitForUserOp(skaUserOpHash);
    } catch {
      // Error here may or may not happen - txn may revert on chain
    }

    // Assert
    const wethBalance = await wethContract.read.balanceOf([aaAccount.aaAddress]);
    expect(wethBalance).toBe(amount);
  }, 30_000);
});
