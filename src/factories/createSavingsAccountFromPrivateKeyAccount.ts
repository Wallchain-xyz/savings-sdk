import { PrivateKeyAccount, createPublicClient, http } from 'viem';

import { PimlicoPaymaster } from '../AAProviders/pimlico/PimlicoPaymaster';
import { SupportedChainId, getChainById } from '../AAProviders/shared/chains';
import { Paymaster } from '../AAProviders/shared/Paymaster';
import { WallchainPaymaster } from '../AAProviders/wallchain/WallchainPaymaster';
import { ZerodevAAProvider } from '../AAProviders/zerodev/ZerodevAAProvider';
import { createApiClient as createAuthClient } from '../api/auth/__generated__/createApiClient';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { createApiClient as createSKAClient } from '../api/ska/__generated__/createApiClient';
import { DEFAULT_BACKEND_URL } from '../consts';
import { StrategiesManager } from '../depositStrategies/StrategiesManager';
import { SavingsAccount } from '../SavingsAccount/SavingsAccount';

import { createPimlicoBundlerUrl } from './utils/createPimlicoBundlerUrl';

import type { ZodiosOptions } from '@zodios/core';

interface CreateSavingsAccountFromKernelValidatorParams {
  apiKey: string;
  privateKeyAccount: PrivateKeyAccount;
  chainId: SupportedChainId;
  savingsBackendUrl?: string;
  rpcUrl?: string;
  bundlerUrl?: string;
  paymasterUrl?: string;
  zodiosOptions?: Partial<ZodiosOptions>;
}

export async function createSavingsAccountFromPrivateKeyAccount({
  apiKey,
  privateKeyAccount,
  chainId,
  savingsBackendUrl,
  bundlerUrl,
  rpcUrl,
  paymasterUrl,
  zodiosOptions,
}: CreateSavingsAccountFromKernelValidatorParams) {
  const authClient = createAuthClient(savingsBackendUrl ?? DEFAULT_BACKEND_URL, zodiosOptions);
  const skaClient = createSKAClient(savingsBackendUrl ?? DEFAULT_BACKEND_URL, zodiosOptions);
  const savingsBackendClient = new SavingsBackendClient({ skaClient, authClient, chainId });

  const chain = getChainById(chainId);

  const strategiesManager = new StrategiesManager(
    createPublicClient({
      transport: http(rpcUrl ?? chain.rpcUrls.default.http[0]),
      chain,
    }),
  );

  const paymaster: Paymaster = paymasterUrl
    ? new PimlicoPaymaster(paymasterUrl)
    : new WallchainPaymaster({
        savingsBackendClient,
        chainId,
      });

  const aaProvider = new ZerodevAAProvider({
    chain,
    bundlerUrl: bundlerUrl ?? createPimlicoBundlerUrl({ chainId, pimlicoApiKey: apiKey }),
    rpcUrl,
  });
  const aaAccount = await aaProvider.createAAAccount(privateKeyAccount);
  aaAccount.setPaymaster(paymaster);

  return new SavingsAccount({
    aaAccount,
    privateKeyAccount,
    savingsBackendClient,
    strategiesManager,
    chainId,
  });
}
