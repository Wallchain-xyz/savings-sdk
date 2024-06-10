import crypto from 'crypto';

import { PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { base } from 'viem/chains';

import { ActiveStrategy } from '../../api/ska/__generated__/createApiClient';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { createSavingsBackendClient } from '../../factories/createSavingsBackendClient';
import { createStrategiesManager } from '../../factories/createStrategiesManager';

const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL ?? ('http://localhost:8000' as string);

describe('E2E SDK test without onchain transactions', () => {
  const makeForAccount = (account: PrivateKeyAccount) =>
    createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: account,
      chainId: base.id,
      savingsBackendUrl,
      apiKey: 'api-key-to-be-removed', // TODO: Maybe not needed?
    });

  it('auth should register for new private key', async () => {
    const privateKey: `0x${string}` = `0x${crypto.randomBytes(32).toString('hex')}`;
    const account = privateKeyToAccount(privateKey);
    const savingsAccount = await makeForAccount(account);
    const { user } = await savingsAccount.auth();
    expect(user.signer_address).toBe(account.address);
  }, 10_000);

  it('auth should login on second request', async () => {
    const privateKey: `0x${string}` = `0x${crypto.randomBytes(32).toString('hex')}`;
    const account = privateKeyToAccount(privateKey);
    const savingsAccount1 = await makeForAccount(account);
    const savingsAccount2 = await makeForAccount(account);
    const userRegister = await savingsAccount1.auth();
    const userLogin = await savingsAccount2.auth();
    expect(userRegister.id).toBe(userLogin.id);
  }, 10_000);

  it('should store SKA', async () => {
    const privateKey: `0x${string}` = `0x${crypto.randomBytes(32).toString('hex')}`;
    const account = privateKeyToAccount(privateKey);
    const savingsAccount = await makeForAccount(account);
    await savingsAccount.auth();
    const allStrategies = savingsAccount.strategiesManager.getStrategies();
    const activeStrategies: ActiveStrategy[] = allStrategies.map(strategy => ({
      strategyId: strategy.id,
      paramValuesByKey: {
        eoaAddress: account.address,
      },
    }));
    await savingsAccount.activateStrategies({ activeStrategies });
    const currentStrategiesIds = (await savingsAccount.getCurrentActiveStrategies()).map(it => it.id);
    expect(currentStrategiesIds).toStrictEqual(activeStrategies.map(it => it.strategyId));
  }, 120_000);

  it('should be able to get strategy detailed info', async () => {
    const savingsBackendClient = createSavingsBackendClient({
      savingsBackendUrl,
    });

    const manager = createStrategiesManager({
      chainId: base.id,
      savingsBackendClient,
    });
    const detailedStrategies = await manager.getStrategiesDetails();
    expect(detailedStrategies[0].apy.current).toBeGreaterThan(0);
  }, 10_000);
});
