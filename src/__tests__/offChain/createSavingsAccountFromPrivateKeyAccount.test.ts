import { Hex, PrivateKeyAccount } from 'viem';

import { base } from 'viem/chains';

import { SavingsAccount, UnauthenticatedError, createSavingsAccountFromPrivateKeyAccount } from '../../index';
import { USDC_TOKEN_ADDRESS } from '../utils/consts';
import { createEoaAccount } from '../utils/createEoaAccount';

const chain = base; // TODO: maybe make it changeable
const privateKey = process.env.PRIVATE_KEY as Hex;
const pimlicoApiKey = process.env.PIMLICO_API_KEY as string;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL ?? ('http://localhost:8000' as string);
describe('savingsAccount', () => {
  let eoaAccount: PrivateKeyAccount;

  beforeEach(() => {
    eoaAccount = createEoaAccount(privateKey);
  });

  it('getCurrentActiveStrategies to return empty array when authed', async () => {
    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl,
      apiKey: pimlicoApiKey,
    });
    await savingsAccount.auth();
    const strategies = await savingsAccount.getCurrentActiveStrategies();
    expect(strategies.length).toBe(0);
  }, 10_000);

  it('middleware to catch error', async () => {
    const testError = new Error('test');
    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl,
      apiKey: pimlicoApiKey,
      apiListeners: {
        onFailed: async ({ error }) => {
          expect(error).toBeInstanceOf(UnauthenticatedError);
          throw testError;
        },
      },
    });
    await expect(async () => {
      await savingsAccount.getCurrentActiveStrategies();
    }).rejects.toThrow(testError);
  });

  it('middleware to retry', async () => {
    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl,
      apiKey: pimlicoApiKey,
      apiListeners: {
        onFailed: async ({ error, retry }) => {
          if (error instanceof UnauthenticatedError) {
            await savingsAccount.auth();
            return retry();
          }
          throw error;
        },
      },
    });
    const strategies = await savingsAccount.getCurrentActiveStrategies();
    expect(strategies.length).toBe(0);
  });

  describe('authed methods', () => {
    let savingsAccount: SavingsAccount;
    let depositStrategyId: string;

    beforeEach(async () => {
      savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
        privateKeyAccount: eoaAccount,
        chainId: chain.id,
        savingsBackendUrl,
        apiKey: pimlicoApiKey,
      });
      const usdcEOAStrategy = savingsAccount.strategiesManager.findStrategy({
        tokenAddress: USDC_TOKEN_ADDRESS,
        isEOA: true,
      });
      depositStrategyId = usdcEOAStrategy.id;
    });
    describe('should throw when not authorized and pass when authorized', () => {
      it('runDepositing', async () => {
        await expect(async () => {
          await savingsAccount.runDepositing();
        }).rejects.toThrow(UnauthenticatedError);

        await savingsAccount.auth();

        const result = await savingsAccount.runDepositing();
        expect(result).toBe(undefined);
      });

      it('getUser', async () => {
        await expect(async () => {
          await savingsAccount.getUser();
        }).rejects.toThrow(UnauthenticatedError);

        await savingsAccount.auth();

        const user = await savingsAccount.getUser();
        expect(user).toBeTruthy();
      });

      it('activateStrategies', async () => {
        async function activateStrategy() {
          await savingsAccount.activateStrategies({
            activeStrategies: [
              {
                strategyId: depositStrategyId,
                paramValuesByKey: {
                  eoaAddress: eoaAccount.address,
                },
              },
            ],
          });
        }

        await expect(async () => {
          await activateStrategy();
        }).rejects.toThrow(UnauthenticatedError);

        await savingsAccount.auth();

        const result = await activateStrategy();
        expect(result).toBe(undefined);
      });

      it('getCurrentActiveStrategies', async () => {
        await expect(async () => {
          await savingsAccount.getCurrentActiveStrategies();
        }).rejects.toThrow(UnauthenticatedError);

        await savingsAccount.auth();

        const result = await savingsAccount.getCurrentActiveStrategies();

        expect(result).toHaveLength(0);
      });

      it('deactivateAllStrategies', async () => {
        await expect(async () => {
          await savingsAccount.deactivateAllStrategies();
        }).rejects.toThrow(UnauthenticatedError);

        await savingsAccount.auth();

        const result = await savingsAccount.deactivateAllStrategies();
        expect(result).toBe(undefined);
      });

      it('withdraw with pauseUntilDatetime', async () => {
        async function withdraw() {
          await savingsAccount.withdraw({
            depositStrategyId,
            amount: 100_000n,
            pauseUntilDatetime: new Date(),
          });
        }

        await expect(async () => {
          await withdraw();
        }).rejects.toThrow(UnauthenticatedError);

        await savingsAccount.auth();
        await expect(async () => {
          await withdraw();
        }).rejects.not.toThrow(UnauthenticatedError);
      });
    });

    describe('should not throw when not authorized', () => {
      it('withdraw without pauseUntilDatetime', async () => {
        await expect(async () => {
          await savingsAccount.withdraw({
            depositStrategyId,
            amount: 100_000n,
          });
        }).rejects.not.toThrow(UnauthenticatedError);
      });

      it('deposit', async () => {
        await expect(async () => {
          await savingsAccount.deposit({
            depositStrategyId,
            amount: 100_000n,
          });
        }).rejects.not.toThrow(UnauthenticatedError);
      });
    });
  });
});
