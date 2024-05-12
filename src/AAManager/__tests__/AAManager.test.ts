import { faker } from '@faker-js/faker';
import { tokenAddresses } from '@zerodev/defi';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { PrivateKeyAccount, createTestClient, http, parseEther, publicActions, walletActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

import { beforeAll, beforeEach, describe, expect, test } from 'vitest';

import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';
import { AAManager } from '../AAManager';
import { entryPoint } from '../EntryPoint';

// import { ensureAccountHasWETHTokenAndGas } from '../../testSuite/defiHelpers';

describe('AAManager', () => {
  let eoaAccount: PrivateKeyAccount;
  let anotherAccount: PrivateKeyAccount;
  let aaManager: AAManager<base>;

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

  beforeEach(async () => {
    const sudoValidator = await signerToEcdsaValidator(testClient, {
      entryPoint,
      signer: eoaAccount,
    });

    aaManager = new AAManager({
      sudoValidator,
      apiKey: process.env.PIMLICO_API_KEY as string,
      chainId: base.id,
      privateKeyAccount: eoaAccount,
    });
    await aaManager.init();
  });

  test('Can give aaAddress', async () => {
    const { aaAddress } = aaManager;
    expect(aaAddress).toBeTruthy();
    expect(aaAddress).not.toEqual(eoaAccount.address);
  });

  test('Allowance checker works', async () => {
    const hasAllowance = await aaManager.getHasAllowance({
      token: tokenAddresses[base.id].WETH,
      owner: eoaAccount.address,
      spender: anotherAccount.address,
      amount: parseEther('1'),
    });

    expect(hasAllowance).toBe(false);
  });
});
