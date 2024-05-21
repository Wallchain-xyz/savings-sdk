import { PrivateKeyAccount, http } from 'viem';

import { base } from 'viem/chains';

import { createPimlicoTransport } from '../../AAManager/transports/createPimlicoTransport';
import { createRPCTransport } from '../../AAManager/transports/createRPCTransport';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

import { ChainHelper } from '../ChainHelper';
import { LOCAL_BUNDLER_URL, LOCAL_CHAIN_RPC_URL } from '../utils/consts';
import { createEoaAccount } from '../utils/createEoaAccount';
import { ensureEoaAddressUsdcAllowance } from '../utils/ensureEoaAddressUsdcAllowance';
import { findUsdcEoaStrategy } from '../utils/findUsdcEoaStrategy';
import { topUpEoaWithUsdcAmountToDeposit } from '../utils/topUpEoaWithUsdcAmountToDeposit';
import { triggerDSToDeposit } from '../utils/triggerDSToDeposit';

import Mock = jest.Mock;

const chain = base; // TODO: maybe make it changeable
jest.mock('../../AAManager/transports/createRPCTransport');
jest.mock('../../AAManager/transports/createPimlicoTransport');

const bundlerTransport = http(LOCAL_BUNDLER_URL);

describe('manual deposit', () => {
  let eoaAccount: PrivateKeyAccount;
  let chainHelper: ChainHelper;

  const testClient = createExtendedTestClient();

  beforeAll(async () => {
    await Promise.all([ensurePaymasterIsReady(), ensureBundlerIsReady(), ensureAnvilIsReady()]);

    chainHelper = new ChainHelper({ chain, rpcURL: LOCAL_CHAIN_RPC_URL });
  }, 10_000);

  beforeEach(() => {
    eoaAccount = createEoaAccount();
  });

  beforeEach(() => {
    (createRPCTransport as Mock).mockReturnValue(http(LOCAL_CHAIN_RPC_URL));
    (createPimlicoTransport as Mock).mockReturnValue(bundlerTransport);
  });

  it('can deposit USDC on Base', async () => {
    const eoaAddress = eoaAccount.address;

    const usdcAmountToDeposit = await topUpEoaWithUsdcAmountToDeposit({
      eoaAddress,
      chainHelper,
      testClient,
    });

    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl: 'http://localhost:8000',
      apiKey: 'ANY',
    });
    const savingsAccountAddress = savingsAccount.aaAddress;
    await ensureEoaAddressUsdcAllowance({
      amountToDeposit: usdcAmountToDeposit,
      chainHelper,
      testClient,
      savingsAccountAddress,
      eoaAccount,
    });

    await savingsAccount.auth();

    const usdcEOAStrategy = findUsdcEoaStrategy();

    await savingsAccount.activateStrategies([
      {
        strategyId: usdcEOAStrategy.id,
        paramValuesByKey: {
          eoaAddress,
        },
      },
    ]);

    // check that bond token was not on AA before deposit
    const savingsAccountBondTokenAmountBeforeDeposit = await chainHelper.getERC20TokenAmount({
      tokenAddress: usdcEOAStrategy.bondTokenAddress,
      accountAddress: savingsAccountAddress,
    });
    expect(savingsAccountBondTokenAmountBeforeDeposit === 0n).toBe(true);

    const eoaAccountTokenAmountBeforeDeposit = await chainHelper.getERC20TokenAmount({
      tokenAddress: usdcEOAStrategy.tokenAddress,
      accountAddress: eoaAddress,
    });

    await triggerDSToDeposit();
    const eoaAccountTokenAmountAfterDeposit = await chainHelper.getERC20TokenAmount({
      tokenAddress: usdcEOAStrategy.tokenAddress,
      accountAddress: eoaAddress,
    });

    // check that bond token is on AA after deposit
    const savingsAccountBondTokenAmountAfterDeposit = await chainHelper.getERC20TokenAmount({
      tokenAddress: usdcEOAStrategy.bondTokenAddress,
      accountAddress: savingsAccountAddress,
    });
    expect(savingsAccountBondTokenAmountAfterDeposit > 0n).toBe(true);

    // check that main token was used during deposit
    expect(eoaAccountTokenAmountBeforeDeposit > eoaAccountTokenAmountAfterDeposit).toBe(true);
  }, 120_000);
});
