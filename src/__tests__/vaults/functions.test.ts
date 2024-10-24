import { Address, createPublicClient, createWalletClient, encodeFunctionData, getContract, http, parseAbi } from 'viem';
import { mainnet } from 'viem/chains';

import { createHelperTestClient } from '../../testSuite/createHelperTestClient';
import { ensureAnvilIsReady } from '../../testSuite/healthCheck';
import { erc20ABI } from '../../utils/erc20ABI';
import { VaultManager } from '../../Vaults/VaultManager';
import { createEoaAccount } from '../utils/createEoaAccount';

describe('vault functions', () => {
  const testClient = createHelperTestClient(mainnet);

  const publicClient = createPublicClient({
    chain: testClient.chain,
    transport: http('http://localhost:8545'),
  });
  const walletClient = createWalletClient({
    account: createEoaAccount(),
    chain: testClient.chain,
    transport: http('http://localhost:8545'),
  });
  const ADMIN_ADDRESS: Address = '0x62c6d517a603a1ef8dd4d875647aaa6bcb064739';

  const vaultsManager = new VaultManager({
    publicClient,
    walletClient,
  });
  const vault = vaultsManager.getVault('crypto-cove-2-v0');
  const assetContract = getContract({
    address: vault.asset,
    abi: erc20ABI,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });

  beforeAll(async () => {
    await Promise.all([ensureAnvilIsReady()]);
    await testClient.ensureChainId({ chainId: mainnet.id });
    await testClient.ensureEnoughBalanceForGas({ address: walletClient.account.address });
    await testClient.ensureEnoughBalanceForGas({ address: ADMIN_ADDRESS });
    await testClient.setERC20Balance({
      tokenAddress: vault.asset,
      accountAddress: walletClient.account.address,
    });
  }, 30_000);

  it('can get tvl', async () => {
    const tvl = await vault.getTvl();

    expect(tvl).toBeGreaterThanOrEqual(0n);
  });

  it('can get balance by address', async () => {
    const balance = await vault.getBalance('0x0000000000000000000000000000000000000000');

    expect(balance).toEqual(0n);
  });

  it('can get own balance', async () => {
    const balance = await vault.getOwnBalance();

    expect(balance).toBeGreaterThanOrEqual(0n);
  });

  it('can get own withdraw info', async () => {
    const withdrawInfo = await vault.getOwnActiveWithdraw();

    expect(withdrawInfo.pendingSharesAmount).toBeGreaterThanOrEqual(0n);
    expect(withdrawInfo.claimableAssetsAmount).toBeGreaterThanOrEqual(0n);
  });

  async function deposit(amount: bigint) {
    const approveHash = await assetContract.write.approve([vault.address, amount]);
    await publicClient.waitForTransactionReceipt({
      hash: approveHash,
    });
    const depositHash = await vault.deposit(amount);
    return publicClient.waitForTransactionReceipt({
      hash: depositHash,
    });
  }

  it('can deposit', async () => {
    const amount = 100n;
    const balanceBefore = await vault.getOwnBalance();

    const depositReceipt = await deposit(amount);

    expect(depositReceipt.status).toEqual('success');
    const balance = await vault.getOwnBalance();
    expect(balance).toEqual(balanceBefore + amount);
  }, 120_000);

  async function requestWithdraw(amount: bigint) {
    const requestWithdrawHash = await vault.requestWithdraw(amount);
    return publicClient.waitForTransactionReceipt({
      hash: requestWithdrawHash,
    });
  }

  it('can request withdraw', async () => {
    const amount = 100n;
    await deposit(amount);
    const activeWithdrawBefore = await vault.getOwnActiveWithdraw();

    const requestWithdrawReceipt = await requestWithdraw(amount);

    expect(requestWithdrawReceipt.status).toEqual('success');
    const activeWithdraw = await vault.getOwnActiveWithdraw();
    expect(activeWithdraw.pendingSharesAmount).toEqual(activeWithdrawBefore.pendingSharesAmount + amount);
  }, 120_000);

  it('can claim withdraw', async () => {
    const assetBalanceBefore = await assetContract.read.balanceOf([walletClient.account.address]);
    const amount = 100n;
    await deposit(amount);
    await requestWithdraw(amount);

    const makeClaimableHash = await testClient.sendUnsignedTransaction({
      from: ADMIN_ADDRESS,
      to: vault.address,
      value: 0n,
      data: encodeFunctionData({
        abi: parseAbi([
          'struct ClaimableAmounts {address controller;uint256 shares;}',
          'function makeRequestsClaimable(ClaimableAmounts[] amounts) public',
        ]),
        functionName: 'makeRequestsClaimable',
        args: [[{ controller: walletClient.account.address, shares: amount }]],
      }),
    });
    await publicClient.waitForTransactionReceipt({
      hash: makeClaimableHash,
    });

    const claimWithdrawHash = await vault.claimWithdraw(amount);
    const claimWithdrawReceipt = await publicClient.waitForTransactionReceipt({
      hash: claimWithdrawHash,
    });

    expect(claimWithdrawReceipt.status).toEqual('success');
    const assetBalanceAfter = await assetContract.read.balanceOf([walletClient.account.address]);
    expect(assetBalanceAfter).toEqual(assetBalanceBefore);
  }, 120_000);
});
