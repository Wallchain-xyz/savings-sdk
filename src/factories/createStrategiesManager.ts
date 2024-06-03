import { createPublicClient, http } from 'viem';

import { SupportedChainId, getChainById } from '../AAProviders/shared/chains';
import { createApiClient as createAuthClient } from '../api/auth/__generated__/createApiClient';
import { createApiClient as createDMSClient } from '../api/dms/__generated__/createApiClient';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { createApiClient as createSKAClient } from '../api/ska/__generated__/createApiClient';
import { DEFAULT_BACKEND_URL } from '../consts';
import { StrategiesManager } from '../depositStrategies/StrategiesManager';

import type { ZodiosOptions } from '@zodios/core';

interface CreateSavingsAccountFromKernelValidatorParams {
  chainId: SupportedChainId;
  savingsBackendUrl?: string;
  rpcUrl?: string;
  zodiosOptions?: Partial<ZodiosOptions>;
}

export async function createStrategiesManager({
  chainId,
  savingsBackendUrl,
  rpcUrl,
  zodiosOptions,
}: CreateSavingsAccountFromKernelValidatorParams) {
  const authClient = createAuthClient(savingsBackendUrl ?? DEFAULT_BACKEND_URL, zodiosOptions);
  const skaClient = createSKAClient(savingsBackendUrl ?? DEFAULT_BACKEND_URL, zodiosOptions);
  const dmsClient = createDMSClient(savingsBackendUrl ?? DEFAULT_BACKEND_URL, zodiosOptions);
  const savingsBackendClient = new SavingsBackendClient({ skaClient, authClient, dmsClient });

  const chain = getChainById(chainId);

  return new StrategiesManager({
    chainId,
    publicClient: createPublicClient({
      transport: http(rpcUrl ?? chain.rpcUrls.default.http[0]),
      chain,
    }),
    savingsBackendClient,
  });
}
