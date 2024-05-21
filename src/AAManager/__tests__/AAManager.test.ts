import { tokenAddresses } from '@zerodev/defi';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { Chain, PrivateKeyAccount, http, parseEther } from 'viem';
import { base } from 'viem/chains';

import { LOCAL_PAYMASTER_RPC_URL } from '../../__tests__/utils/consts';
import { createEoaAccount } from '../../__tests__/utils/createEoaAccount';
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
    eoaAccount = createEoaAccount();
    anotherAccount = createEoaAccount();

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
      apiKey: 'ANY',
      chainId: base.id,
      privateKeyAccount: eoaAccount,
      async getSponsorshipInfo(userOperation) {
        const pimlicoPaymasterClient = createPimlicoPaymasterClient({
          entryPoint,
          transport: http(LOCAL_PAYMASTER_RPC_URL),
        });
        return pimlicoPaymasterClient.sponsorUserOperation({
          userOperation,
        });
      },
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
