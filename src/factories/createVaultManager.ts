import { createPublicClient, http } from 'viem';

import { VaultManager } from '../Vaults/VaultManager';
import { WalletClientWithChain } from '../Vaults/ViemDefinitions';

interface CreateVaultManagerParams {
  walletClient: WalletClientWithChain;
  rpcUrl?: string;
}

export function createVaultManager({ walletClient, rpcUrl }: CreateVaultManagerParams): VaultManager {
  return new VaultManager({
    walletClient,
    publicClient: createPublicClient({
      transport: http(rpcUrl ?? walletClient.chain.rpcUrls.default.http[0]),
    }),
  });
}
