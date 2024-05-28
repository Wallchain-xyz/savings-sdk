import { faker } from '@faker-js/faker';
import {
  createPublicClient,
  encodeFunctionData,
  getAbiItem,
  getAddress,
  getContract,
  http,
  parseAbi,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { polygonAmoy } from 'viem/chains';

import { createEoaAccount } from '../../__tests__/utils/createEoaAccount';

import { BiconomyAAProvider } from './BiconomyAAProvider';
import { BiconomyPaymaster } from './BiconomyPaymaster';

const WETH_ABI = parseAbi([
  'function deposit() public payable',
  'function withdraw(uint wad) public',
  'function balanceOf(address owner) view returns (uint256)',
]);
const ABI_DEPOSIT = getAbiItem({ abi: WETH_ABI, name: 'deposit' });
const ABI_WITHDRAW = getAbiItem({ abi: WETH_ABI, name: 'withdraw' });

const WETH_ADDR = '0x360ad4f9a9a8efe9a8dcb5f461c4cc1047e1dcf9';

// Keys here are only for testnet, so this is not a problem to hardcode them.
const OWNER_PK = '0xa5f01239aaa789d09e7277c6880101902e1dd7f4d51c5388429f0a6b94b02231';

const TESTNET_BUNDLER_URL = 'https://bundler.biconomy.io/api/v2/80002/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44';
const TESTNET_PAYMASTER_URL =
  'https://paymaster.biconomy.io/api/v1/80002/oqEelh2LL.5de0b116-de3e-4084-aa25-5bf6ccd7fbf9';

describe('Biconomy Provider Polygon Amoy', () => {
  const owner = privateKeyToAccount(OWNER_PK);
  const provider = new BiconomyAAProvider({
    chain: polygonAmoy,
    bundlerUrl: TESTNET_BUNDLER_URL,
  });
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
  });
  let paymaster: BiconomyPaymaster;

  beforeAll(async () => {
    paymaster = await BiconomyPaymaster.create(TESTNET_PAYMASTER_URL);
  });

  it('send simple txn', async () => {
    // Arrange
    const aaAccount = await provider.createAAAccount(owner);
    const receiver = createEoaAccount().address;
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
    const receiverBalance = await publicClient.getBalance({
      address: receiver,
    });
    expect(receiverBalance).toBe(amount);
  }, 30_000);

  it('send sponsored simple txn', async () => {
    // Arrange
    const aaAccount = await provider.createAAAccount(owner);
    const balanceBefore = await publicClient.getBalance({ address: aaAccount.aaAddress });
    const receiver = getAddress(faker.string.hexadecimal({ length: 40 }));
    const amount = faker.number.bigInt({ min: 1n, max: 200n });

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
    const receiverBalance = await publicClient.getBalance({
      address: receiver,
    });
    expect(receiverBalance).toBe(amount);
    const balanceAfter = await publicClient.getBalance({ address: aaAccount.aaAddress });
    expect(balanceBefore - balanceAfter).toBe(amount);
  }, 30_000);

  it('should create SKA that can deposit and withdraw', async () => {
    // Arrange
    const aaAccount = await provider.createAAAccount(owner);
    const skaSigner = privateKeyToAccount(faker.string.hexadecimal({ length: 64 }) as `0x${string}`);
    const amountDeposit = faker.number.bigInt({ min: 101n, max: 200n });
    const amountWithdraw = faker.number.bigInt({ min: 1n, max: 100n });

    const wethContract = getContract({
      address: WETH_ADDR,
      abi: WETH_ABI,
      client: publicClient,
    });
    const balanceBefore = await wethContract.read.balanceOf([aaAccount.aaAddress]);
    // Act
    const skaData = await aaAccount.createSessionKey({
      skaAddress: skaSigner.address,
      permissions: [
        {
          target: WETH_ADDR,
          functionName: 'deposit',
          valueLimit: parseEther('100000'),
          abi: [ABI_DEPOSIT],
          args: [],
        },
        {
          target: WETH_ADDR,
          functionName: 'withdraw',
          valueLimit: parseEther('0'),
          abi: [ABI_WITHDRAW],
          args: [],
        },
      ],
    });

    let userOpHash = await aaAccount.sendTxns(skaData.txnsToActivate);
    await aaAccount.waitForUserOp(userOpHash);
    const saAccount = await provider.createSKAccount({
      skaSigner,
      serializedSKAData: skaData.serializedSKAData,
    });
    userOpHash = await saAccount.sendTxns([
      {
        to: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
        data: encodeFunctionData({
          abi: [ABI_DEPOSIT],
          functionName: 'deposit',
          args: [],
        }),
        value: amountDeposit,
      },
      {
        to: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
        data: encodeFunctionData({
          abi: [ABI_WITHDRAW],
          functionName: 'withdraw',
          args: [amountWithdraw],
        }),
        value: 0n,
      },
    ]);
    await aaAccount.waitForUserOp(userOpHash);

    // Assert
    const balanceAfter = await wethContract.read.balanceOf([aaAccount.aaAddress]);
    expect(balanceAfter).toBe(balanceBefore + amountDeposit - amountWithdraw);
  }, 30_000);
});
