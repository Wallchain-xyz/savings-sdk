// TODO: @merlin merge with withLocal chain tests
// copy of with comments: /src/__tests__/withLocalChain/eoaAutoDeposit.test.ts
import { Hex, PrivateKeyAccount } from 'viem';

import { base } from 'viem/chains';

import { createSavingsAccountFromPrivateKeyAccount } from '../../factories/createSavingsAccountFromPrivateKeyAccount';

import { ChainHelper } from '../ChainHelper';
import { createEoaAccount } from '../utils/createEoaAccount';
import { ensureEoaAddressUsdcAllowance } from '../utils/ensureEoaAddressUsdcAllowance';
import { findUsdcEoaStrategy } from '../utils/findUsdcEoaStrategy';
import { triggerDSToDeposit } from '../utils/triggerDSToDeposit';

const chain = base; // TODO: maybe make it changeable
// jest.mock('../../AAManager/transports/createRPCTransport');
// jest.mock('../../AAManager/transports/createPimlicoTransport');
//
// const bundlerTransport = http(LOCAL_BUNDLER_URL);

// REAL CHAIN SPECIFIC
const privateKey = process.env.PRIVATE_KEY as Hex;
const pimlicoApiKey = process.env.PIMLICO_API_KEY as string;
const usdcAmountToDeposit = BigInt(process.env.USDC_AMOUNT ?? '') as bigint;
const wrappedDescribe = pimlicoApiKey && privateKey ? describe : describe.skip;
wrappedDescribe('eoa manual deposit', () => {
  // END REAL CHAIN SPECIFIC
  let eoaAccount: PrivateKeyAccount;
  let chainHelper: ChainHelper;

  // const testClient = createExtendedTestClient();

  beforeAll(async () => {
    // await Promise.all([ensurePaymasterIsReady(), ensureBundlerIsReady(), ensureAnvilIsReady()]);

    chainHelper = new ChainHelper({
      chain,
      // rpcURL: LOCAL_CHAIN_RPC_URL
    });
  }, 10_000);

  beforeEach(() => {
    // eoaAccount = createEoaAccount();
    // REAL CHAIN SPECIFIC
    eoaAccount = createEoaAccount(privateKey);
    // END REAL CHAIN SPECIFIC
  });

  // beforeEach(() => {
  //   (createRPCTransport as Mock).mockReturnValue(http(LOCAL_CHAIN_RPC_URL));
  //   (createPimlicoTransport as Mock).mockReturnValue(bundlerTransport);
  // });

  it('can deposit USDC on Base', async () => {
    const eoaAddress = eoaAccount.address;

    // const usdcAmountToDeposit = await topUpEoaWithUsdcAmountToDeposit({
    //   eoaAddress,
    //   chainHelper,
    //   testClient,
    // });

    const savingsAccount = await createSavingsAccountFromPrivateKeyAccount({
      privateKeyAccount: eoaAccount,
      chainId: chain.id,
      savingsBackendUrl: 'http://localhost:8000',
      // REAL CHAIN SPECIFIC
      apiKey: pimlicoApiKey,
      // END REAL CHAIN SPECIFIC
      // apiKey: 'ANY',
    });
    const savingsAccountAddress = savingsAccount.aaAddress;
    await ensureEoaAddressUsdcAllowance({
      amountToDeposit: usdcAmountToDeposit,
      chainHelper,
      savingsAccountAddress,
      eoaAccount,
    });

    await savingsAccount.auth();

    const usdcEOAStrategy = findUsdcEoaStrategy();

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
