import { faker } from '@faker-js/faker';
import { tokenAddresses } from '@zerodev/defi';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { Chain, PrivateKeyAccount, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';
import { AAManager } from '../AAManager';
import { entryPoint } from '../EntryPoint';

describe('AAManager', () => {
  let eoaAccount: PrivateKeyAccount;
  let anotherAccount: PrivateKeyAccount;
  let aaManager: AAManager<Chain>;

  const testClient = createExtendedTestClient();

  beforeAll(async () => {
    await ensurePaymasterIsReady();
    await ensureBundlerIsReady();
    await ensureAnvilIsReady();
  }, 10_000);

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
    if (!process.env.PIMLICO_API_KEY) {
      throw new Error('Please set env variable PIMLICO_API_KEY to run tests');
    }

    aaManager = new AAManager({
      sudoValidator,
      apiKey: process.env.PIMLICO_API_KEY,
      chainId: base.id,
      privateKeyAccount: eoaAccount,
    });
    await aaManager.init();
  });

  it('Can give aaAddress', async () => {
    const { aaAddress } = aaManager;
    expect(aaAddress).toBeTruthy();
    expect(aaAddress).not.toEqual(eoaAccount.address);
  });

  it('Allowance checker works', async () => {
    // @ts-expect-error test private method
    const hasAllowance = await aaManager.getHasAllowance({
      token: tokenAddresses[base.id].WETH,
      owner: eoaAccount.address,
      spender: anotherAccount.address,
      amount: parseEther('1'),
    });

    expect(hasAllowance).toBe(false);
  });
});
