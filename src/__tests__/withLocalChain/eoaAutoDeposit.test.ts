import { PrivateKeyAccount, parseEther } from 'viem';
import { base } from 'viem/chains';

import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';
import { createExtendedTestClient } from '../../testSuite/createExtendedTestClient';
import { ensureAnvilIsReady, ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

import { ChainHelper } from '../utils/ChainHelper';
import { LOCAL_BUNDLER_URL, LOCAL_CHAIN_RPC_URL, LOCAL_PAYMASTER_RPC_URL, USDC_TOKEN_ADDRESS } from '../utils/consts';
import { createEoaAccount } from '../utils/createEoaAccount';
import { ensureEoaAddressUsdcAllowance } from '../utils/ensureEoaAddressUsdcAllowance';
import { topUpUSDC } from '../utils/topUpUSDC';
import { waitForSeconds } from '../utils/waitForSeconds';

const chain = base;
const savingsBackendUrl = process.env.SAVINGS_BACKEND_URL ?? ('http://localhost:8000' as string);

// TODO: @merlin add support for anvil on SKA
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('auto deposit', () => {
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

  it('can deposit USDC on Base', async () => {
    const eoaAddress = eoaAccount.address;

    const usdcAmountToDeposit = await topUpUSDC({
      address: eoaAddress,
      chainHelper,
      testClient,
    });

    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl,
      rpcUrl: LOCAL_CHAIN_RPC_URL,
      bundlerUrl: LOCAL_BUNDLER_URL,
      paymasterUrl: LOCAL_PAYMASTER_RPC_URL,
    });
    const savingsAccountAddress = savingsAccount.aaAddress;
    testClient.setBalance({
      address: eoaAddress,
      value: parseEther('42'),
    });
    await ensureEoaAddressUsdcAllowance({
      amountToDeposit: usdcAmountToDeposit,
      chainHelper,
      savingsAccountAddress,
      eoaAccount,
    });

    await savingsAccount.auth();

    const usdcEOAStrategy = savingsAccount.strategiesManager.findStrategy({
      tokenAddress: USDC_TOKEN_ADDRESS,
      isEOA: true,
    });

    await savingsAccount.activateStrategies({
      activeStrategies: [
        {
          strategyId: usdcEOAStrategy.id,
          paramValuesByKey: {
            eoaAddress,
          },
        },
      ],
    });

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

    await savingsAccount.runDepositing();
    await waitForSeconds(5);
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
