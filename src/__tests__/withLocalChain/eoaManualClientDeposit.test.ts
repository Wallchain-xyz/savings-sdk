import { PrivateKeyAccount, http, parseEther } from 'viem';

import { base } from 'viem/chains';

import { createPimlicoTransport } from '../../AAManager/transports/createPimlicoTransport';
import { createRPCTransport } from '../../AAManager/transports/createRPCTransport';
import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

import { ChainHelper } from '../ChainHelper';
import { LOCAL_BUNDLER_URL, LOCAL_CHAIN_RPC_URL, USDC_TOKEN_ADDRESS } from '../utils/consts';

import { createEoaAccount } from '../utils/createEoaAccount';
import { ensureEoaAddressUsdcAllowance } from '../utils/ensureEoaAddressUsdcAllowance';
import { findUsdcEoaStrategy } from '../utils/findUsdcEoaStrategy';
import { topUpEoaWithUsdcAmountToDeposit } from '../utils/topUpEoaWithUsdcAmountToDeposit';

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

    testClient.setBalance({
      address: eoaAddress,
      value: parseEther('42'),
    });

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

    const usdcEoaStrategy = findUsdcEoaStrategy();

    const { bondTokenAddress } = usdcEoaStrategy;
    const savingsAccountBondTokenAmountBeforeDeposit = await chainHelper.getERC20TokenAmount({
      tokenAddress: bondTokenAddress,
      accountAddress: savingsAccountAddress,
    });
    expect(savingsAccountBondTokenAmountBeforeDeposit === 0n).toBe(true);

    const depositResponse = await savingsAccount.deposit({
      amount: usdcAmountToDeposit,
      depositStrategyId: usdcEoaStrategy.id,
    });
    expect(depositResponse.receipt.status).toBe('success');

    const savingsAccountBondTokenAmountAfterDeposit = await chainHelper.getERC20TokenAmount({
      tokenAddress: bondTokenAddress,
      accountAddress: savingsAccountAddress,
    });
    expect(savingsAccountBondTokenAmountAfterDeposit > 0n).toBe(true);

    // withdrawal
    const withdrawResponse = await savingsAccount.withdraw({
      amount: usdcAmountToDeposit,
      depositStrategyId: usdcEoaStrategy.id,
    });
    expect(withdrawResponse.receipt.status).toBe('success');

    const savingsAccountBondTokenAmountAfterWithdraw = await chainHelper.getERC20TokenAmount({
      tokenAddress: bondTokenAddress,
      accountAddress: savingsAccountAddress,
    });
    expect(savingsAccountBondTokenAmountAfterWithdraw === 0n).toBe(true);

    const eoaUsdcAmountAfterWithdraw = await chainHelper.getERC20TokenAmount({
      tokenAddress: USDC_TOKEN_ADDRESS,
      accountAddress: eoaAddress,
    });
    expect(eoaUsdcAmountAfterWithdraw).toBeGreaterThanOrEqual(usdcAmountToDeposit);
  }, 120_000);
});
