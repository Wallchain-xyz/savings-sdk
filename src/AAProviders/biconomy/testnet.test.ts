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

import { BiconomyAAProvider } from './provider';

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

const BUNDLER_URL = 'https://bundler.biconomy.io/api/v2/80002/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44';

describe('Biconomy Provider Polygon Amoy', () => {
  const owner = privateKeyToAccount(OWNER_PK);
  const provider = new BiconomyAAProvider({
    chain: polygonAmoy,
    bundlerUrl: BUNDLER_URL,
  });
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
  });

  it('send simple txn', async () => {
    // Arrange
    const aaAccount = await provider.createAAAccount(owner);
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
    const receiverBalance = await publicClient.getBalance({
      address: receiver,
    });
    expect(receiverBalance).toBe(123n);
  }, 30_000);

  it('should create SKA that can deposit and withdraw', async () => {
    // Arrange
    const aaAccount = await provider.createAAAccount(owner);
    const skaAccount = privateKeyToAccount(faker.string.hexadecimal({ length: 64 }) as `0x${string}`);

    const wethContract = getContract({
      address: WETH_ADDR,
      abi: WETH_ABI,
      client: publicClient,
    });
    const balanceBefore = await wethContract.read.balanceOf([aaAccount.aaAddress]);
    // Act
    const skaData = await aaAccount.createSessionKey(skaAccount.address, [
      {
        target: WETH_ADDR,
        functionName: 'deposit',
        valueLimit: parseEther('100000'),
        abi: ABI_DEPOSIT,
        rules: [],
      },
      {
        target: WETH_ADDR,
        functionName: 'withdraw',
        valueLimit: parseEther('0'),
        abi: ABI_WITHDRAW,
        rules: [],
      },
    ]);

    let userOpHash = await aaAccount.sendTxns(skaData.txnsToActivate);
    await aaAccount.waitForUserOp(userOpHash);
    const saAccount = await provider.createSKAccount(skaAccount, skaData.serializedSKAData);
    userOpHash = await saAccount.sendTxns([
      {
        to: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
        data: encodeFunctionData({
          abi: [ABI_DEPOSIT],
          functionName: 'deposit',
          args: [],
        }),
        value: 100n,
      },
      {
        to: '0x360ad4f9a9A8EFe9A8DCB5f461c4Cc1047E1Dcf9',
        data: encodeFunctionData({
          abi: [ABI_WITHDRAW],
          functionName: 'withdraw',
          args: [50n],
        }),
        value: 0n,
      },
    ]);
    await aaAccount.waitForUserOp(userOpHash);

    // Assert
    const balanceAfter = await wethContract.read.balanceOf([aaAccount.aaAddress]);
    expect(balanceAfter).toBe(balanceBefore + 50n);
  }, 30_000);
});
