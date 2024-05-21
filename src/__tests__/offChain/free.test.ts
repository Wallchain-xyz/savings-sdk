import crypto from 'crypto';

import { PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { base } from 'viem/chains';

import { ActiveStrategy } from '../../api/ska/__generated__/createApiClient';
import { getSupportedDepositStrategies } from '../../depositStrategies';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

describe('E2E SDK test without onchain transactions', () => {
  const makeForAccount = (account: PrivateKeyAccount) =>
    createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: account,
      chainId: base.id, // TODO: maybe make it changeable
      savingsBackendUrl: 'https://dev.api.wallchains.com',
      apiKey: 'api-key-to-be-removed', // TODO: Maybe not needed?
    });

  it('auth should register for new private key', async () => {
    const privateKey: `0x${string}` = `0x${crypto.randomBytes(32).toString('hex')}`;
    const account = privateKeyToAccount(privateKey);
    const savingsAccount = await makeForAccount(account);
    const user = await savingsAccount.auth();
    expect(user.ownerships[0].signer_address).toBe(account.address);
    expect(user.ownerships[0].aa_address).toBe(savingsAccount.aaAddress);
    expect(user.ownerships[0].chain_id).toBe(base.id); // TODO: maybe make it changeable
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
    const allStrategies = getSupportedDepositStrategies();
    const activeStrategies: ActiveStrategy[] = allStrategies.map(strategy => ({
      strategyId: strategy.id,
      paramValuesByKey: {
        eoaAddress: account.address,
      },
    }));
    await savingsAccount.activateStrategies(activeStrategies);
    const currentActiveStrategies = await savingsAccount.getCurrentActiveStrategies();
    expect(currentActiveStrategies).toStrictEqual(allStrategies);
  }, 120_000);
});
