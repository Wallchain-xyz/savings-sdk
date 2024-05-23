import { PrivateKeyAccount, parseEther } from 'viem';

import { base } from 'viem/chains';

import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';
import { LOCAL_BUNDLER_URL, LOCAL_CHAIN_RPC_URL, LOCAL_PAYMASTER_RPC_URL } from '../utils/consts';
import { createEoaAccount } from '../utils/createEoaAccount';

const chain = base; // TODO: maybe make it changeable

describe('manual deposit', () => {
  let eoaAccount: PrivateKeyAccount;

  const testClient = createExtendedTestClient();

  beforeAll(async () => {
    await ensurePaymasterIsReady();
    await ensureBundlerIsReady();
    await ensureAnvilIsReady();
  }, 10_000);

  beforeEach(() => {
    eoaAccount = createEoaAccount();
  });

  it('can deposit ETH on Base', async () => {
    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl: 'http://localhost:8000',
      apiKey: 'ANY',
      rpcUrl: LOCAL_CHAIN_RPC_URL,
      bundlerUrl: LOCAL_BUNDLER_URL,
      paymasterUrl: LOCAL_PAYMASTER_RPC_URL,
    });
    testClient.setBalance({
      address: savingsAccount.aaAddress,
      value: parseEther('42'),
    });

    const userOpHash = await savingsAccount.deposit({
      amount: parseEther('1'),
      depositStrategyId: '018ecbc3-597e-739c-bfac-80d534743e3e', // Beefy ETH on Base strategy
    });
    expect(userOpHash).toBeTruthy();
  }, 120_000);
});
