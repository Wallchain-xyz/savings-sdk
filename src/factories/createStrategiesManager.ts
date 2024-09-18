import { createPublicClient, http } from 'viem';

import { SupportedChainId, getChainById } from '../AAProviders/shared/chains';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { StrategiesManager } from '../depositStrategies/StrategiesManager';

interface CreateStrategiesManagerParams {
  chainId: SupportedChainId;
  savingsBackendClient: SavingsBackendClient;
  rpcUrl?: string;
}

export function createStrategiesManager({
  chainId,
  savingsBackendClient,
  rpcUrl,
}: CreateStrategiesManagerParams): StrategiesManager {
  const chain = getChainById(chainId);

  return new StrategiesManager({
    chainId,
    publicClient: createPublicClient({
      transport: http(rpcUrl ?? chain.rpcUrls.default.http[0], {
        // increased statically for now, because mezo protocol requires reading logs
        // to get bondTokenAmount
        timeout: 60_000,
      }),
      chain,
    }),
    savingsBackendClient,
  });
}
