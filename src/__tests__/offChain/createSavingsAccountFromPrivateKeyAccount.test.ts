import { Hex, PrivateKeyAccount } from 'viem';

import { base } from 'viem/chains';

import { ServerAPIError } from '../../api/shared/errors';
import {
  SavingsAccount,
  StrategyNotFoundError,
  UnauthenticatedError,
  createSavingsAccountFromPrivateKeyAccount,
} from '../../index';
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

  describe('setAuthToken', () => {
    it('should allow to use saved auth token', async () => {
      const previousSavingsAccount = await createSavingsAccountFromPrivateKeyAccount({
        privateKeyAccount: eoaAccount,
        chainId: chain.id,
        savingsBackendUrl,
        apiKey: pimlicoApiKey,
      });

      const { token } = await previousSavingsAccount.auth();

      const newSavingsAccount = await createSavingsAccountFromPrivateKeyAccount({
        privateKeyAccount: eoaAccount,
        chainId: chain.id,
        savingsBackendUrl,
        apiKey: pimlicoApiKey,
      });

      await expect(async () => {
        await newSavingsAccount.getUser();
      }).rejects.toThrow();

      newSavingsAccount.setAuthToken(token);

      const user = await newSavingsAccount.getUser();
      expect(user).toBeTruthy();
    }, 10_000);
  });

  describe('apiListeners', () => {
    it('should allow to catch error', async () => {
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
        await savingsAccount.getUser();
      }).rejects.toThrow(testError);
    });

    it('should allow to retry', async () => {
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
      const user = await savingsAccount.getUser();
      expect(user).toBeTruthy();
    });

    it('should override old auth with new auth token', async () => {
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
      savingsAccount.setAuthToken('wrong_token');
      const user = await savingsAccount.getUser();
      expect(user).toBeTruthy();
    });
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

    it('should set headers for all clients when authed', async () => {
      const { token } = await savingsAccount.auth();

      // @ts-expect-error testing private method
      expect(savingsAccount.savingsBackendClient.authClient.axios.defaults.headers.common.Authorization).toBe(
        `Bearer ${token}`,
      );
      // @ts-expect-error testing private method
      expect(savingsAccount.savingsBackendClient.skaClient.axios.defaults.headers.common.Authorization).toBe(
        `Bearer ${token}`,
      );
      // @ts-expect-error testing private method
      expect(savingsAccount.savingsBackendClient.dmsClient.axios.defaults.headers.common.Authorization).toBe(
        `Bearer ${token}`,
      );
    });

    describe('should throw when not authorized and pass when authorized', () => {
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
        expect(result).toBeUndefined();
      }, 10_000);

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
        expect(result).toBeUndefined();
      });

      it('withdraw with pauseUntilDatetime', async () => {
        await expect(async () => {
          await savingsAccount.withdraw({
            depositStrategyId,
            pauseUntilDatetime: new Date(),
          });
        }).rejects.toThrow(UnauthenticatedError);

        await savingsAccount.auth();
        await expect(async () => {
          await savingsAccount.withdraw({
            depositStrategyId,
            pauseUntilDatetime: new Date(),
          });
        }).rejects.not.toThrow(UnauthenticatedError);
      });

      describe('should throw when SKA not created', () => {
        it('runDepositing', async () => {
          await expect(async () => {
            await savingsAccount.runDepositing();
          }).rejects.toThrow(UnauthenticatedError);

          await savingsAccount.auth();

          await expect(async () => {
            await savingsAccount.runDepositing();
          }).rejects.toThrow(ServerAPIError);
        });
      });
    });

    describe('should not throw when not authorized', () => {
      it('withdraw without pauseUntilDatetime', async () => {
        await expect(async () => {
          await savingsAccount.withdraw({
            depositStrategyId,
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

  describe('with savings account', () => {
    let savingsAccount: SavingsAccount;
    beforeEach(async () => {
      savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
        privateKeyAccount: eoaAccount,
        chainId: chain.id,
        savingsBackendUrl,
        apiKey: pimlicoApiKey,
      });
    });

    describe('withdraw', () => {
      it('throws not found error when incorrect strategy id is passed', async () => {
        await expect(() => {
          return savingsAccount.withdraw({
            amount: 0n,
            depositStrategyId: 'incorrect string',
          });
        }).rejects.toThrow(StrategyNotFoundError);
      });

      it('returns undefined hash if 0 amount passed', async () => {
        const userOpResult = await savingsAccount.withdraw({
          amount: 0n,
          depositStrategyId: '018ecbc3-597e-739c-bfac-80d534743e3e',
        });
        expect(userOpResult.success).toBe(true);
        expect(userOpResult.txnHash).toBeUndefined();
      });
    });

    describe('deposit', () => {
      it('throws not found error when incorrect strategy id is passed', async () => {
        await expect(() => {
          return savingsAccount.deposit({
            amount: 0n,
            depositStrategyId: 'incorrect string',
          });
        }).rejects.toThrow(StrategyNotFoundError);
      });

      it('returns undefined hash if 0 amount passed', async () => {
        const userOpResult = await savingsAccount.deposit({
          amount: 0n,
          depositStrategyId: '018ecbc3-597e-739c-bfac-80d534743e3e',
        });
        expect(userOpResult.success).toBe(true);
        expect(userOpResult.txnHash).toBeUndefined();
      });
    });
  });
});
