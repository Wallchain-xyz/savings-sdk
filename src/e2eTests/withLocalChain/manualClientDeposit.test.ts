import { faker } from '@faker-js/faker';
import { createPimlicoBundlerClient, createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { PrivateKeyAccount, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { base } from 'viem/chains';

import { entryPoint } from '../../AAManager/EntryPoint';
import { createPimlicoTransport } from '../../AAManager/transports/createPimlicoTransport';
import { createRPCTransport } from '../../AAManager/transports/createRPCTransport';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

import Mock = jest.Mock;

const chain = base; // TODO: maybe make it changeable
const LOCAL_CHAIN_RPC = `http://localhost:8545`;
const LOCAL_BUNDLER_URL = 'http://localhost:4337';
const LOCAL_PAYMASTER_RPC_URL = `http://localhost:4330`;
jest.mock('../../AAManager/transports/createRPCTransport');
jest.mock('../../AAManager/transports/createPimlicoTransport');

const bundlerTransport = http(LOCAL_BUNDLER_URL);
describe('manual deposit', () => {
  let eoaAccount: PrivateKeyAccount;

  const testClient = createExtendedTestClient();

  beforeAll(async () => {
    await ensurePaymasterIsReady();
    await ensureBundlerIsReady();
    await ensureAnvilIsReady();
  }, 10_000);

  beforeEach(() => {
    eoaAccount = privateKeyToAccount(faker.string.hexadecimal({ length: 64 }) as `0x${string}`);
    testClient.setBalance({
      address: eoaAccount.address,
      value: parseEther('42'),
    });
  });

  beforeEach(() => {
    (createRPCTransport as Mock).mockReturnValue(http(LOCAL_CHAIN_RPC));

    (createPimlicoTransport as Mock).mockReturnValue(bundlerTransport);
  });

  it('can deposit ETH on Base', async () => {
    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl: 'http://localhost:8000',
      apiKey: 'ANY',
    });

    await savingsAccount.auth();
    // const allStrategies = getSupportedDepositStrategies();
    // const strategiesIds = allStrategies.map(it => it.id);
    // await savingsAccount.activateStrategies(strategiesIds);
    //
    // const activeStrategies = await savingsAccount.getActiveStrategies();
    // expect(activeStrategies).toStrictEqual(allStrategies);

    // @ts-expect-error private method to mock
    // eslint-disable-next-line no-unused-expressions
    savingsAccount.savingsBackendClient.getSponsorshipInfo = async ({ userOperation }) => {
      const bundlerClient = createPimlicoBundlerClient({
        transport: bundlerTransport,
        entryPoint,
      });
      const gasPrices = await bundlerClient.getUserOperationGasPrice();
      const gasEstimates = {
        maxFeePerGas: gasPrices.standard.maxFeePerGas,
        maxPriorityFeePerGas: gasPrices.standard.maxPriorityFeePerGas,
      };
      const userOperationWithGasEstimates = {
        ...userOperation,
        ...gasEstimates,
      };
      const pimlicoPaymasterClient = createPimlicoPaymasterClient({
        entryPoint,
        transport: http(LOCAL_PAYMASTER_RPC_URL),
      });
      const sponsorshipInfo = await pimlicoPaymasterClient.sponsorUserOperation({
        // @ts-expect-error asdfs
        userOperation: userOperationWithGasEstimates,
      });
      return {
        ...sponsorshipInfo,
        ...gasEstimates,
      };
    };
    const hash = await savingsAccount.deposit({
      amount: BigInt(1),
      depositStrategyId: '018ecbc3-597e-739c-bfac-80d534743e3e',
    });
    expect(hash).toBeTruthy();
  }, 2000_000);
});