import { PrivateKeyAccount, createPublicClient, http } from 'viem';

import { PimlicoPaymaster } from '../AAProviders/pimlico/PimlicoPaymaster';
import { SupportedChainId, getChainById } from '../AAProviders/shared/chains';
import { Paymaster } from '../AAProviders/shared/Paymaster';
import { WallchainPaymaster } from '../AAProviders/wallchain/WallchainPaymaster';
import { ZerodevAAProvider } from '../AAProviders/zerodev/ZerodevAAProvider';
import { createAuthClient } from '../api/auth/createAuthClient';
import { createDmsClient } from '../api/dms/createDmsClient';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { AddApiListenersParams } from '../api/shared/addApiListeners';
import { createSKAClient } from '../api/ska/createSKAClient';
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
  apiListeners?: AddApiListenersParams['apiListeners'];
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
  apiListeners,
}: CreateSavingsAccountFromKernelValidatorParams) {
  const apiClientParams = {
    baseUrl: savingsBackendUrl ?? DEFAULT_BACKEND_URL,
    zodiosOptions,
    apiListeners,
  };
  const authClient = createAuthClient(apiClientParams);
  const skaClient = createSKAClient(apiClientParams);
  const dmsClient = createDmsClient(apiClientParams);
  const savingsBackendClient = new SavingsBackendClient({
    skaClient,
    authClient,
    dmsClient,
  });

  const chain = getChainById(chainId);

  const publicClient = createPublicClient({
    transport: http(rpcUrl ?? chain.rpcUrls.default.http[0]),
    chain,
  });

  const strategiesManager = new StrategiesManager({
    chainId,
    publicClient,
    savingsBackendClient,
  });

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
