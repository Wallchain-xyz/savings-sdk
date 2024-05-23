import { PrivateKeyAccount, createPublicClient, http } from 'viem';

import { PimlicoPaymaster } from '../AAProviders/pimlico/paymaster';
import { Paymaster } from '../AAProviders/types';
import { WallchainPaymaster } from '../AAProviders/wallchain/paymaster';
import { ZerodevProvider } from '../AAProviders/zerodev/provider';
import { chain_id as ChainId, createApiClient as createAuthClient } from '../api/auth/__generated__/createApiClient';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { createApiClient as createSKAClient } from '../api/ska/__generated__/createApiClient';
import { DEFAULT_BACKEND_URL } from '../consts';
import { StrategiesManager } from '../depositStrategies/StrategiesManager';
import { SavingsAccount } from '../SavingsAccount/SavingsAccount';

import { getPimlicoBundlerUrl } from './bundler';
import { getChainById } from './chains';

import type { ZodiosOptions } from '@zodios/core';

interface CreateSavingsAccountFromKernelValidatorParams {
  apiKey: string;
  privateKeyAccount: PrivateKeyAccount;
  chainId: ChainId;
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

  const aaProvider = new ZerodevProvider({
    chain,
    bundlerUrl: bundlerUrl ?? getPimlicoBundlerUrl({ chainId, pimlicoApiKey: apiKey }),
    rpcUrl,
  });
  const aaAccount = await aaProvider.createAAAccount(privateKeyAccount);
  const strategiesManager = new StrategiesManager(
    createPublicClient({
      transport: http(rpcUrl ?? chain.rpcUrls.default.http[0]),
      chain,
    }),
  );

  let paymaster: Paymaster = new WallchainPaymaster({
    savingsBackendClient,
    chainId,
  });
  if (paymasterUrl) {
    paymaster = new PimlicoPaymaster(paymasterUrl);
  }

  return new SavingsAccount({
    aaAccount,
    privateKeyAccount,
    savingsBackendClient,
    strategiesManager,
    paymaster,
    chainId,
  });
}
