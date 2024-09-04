import { ExtendedRealClient } from '../createExtendedRealClient';
import { ExtendedTestClient } from '../createExtendedTestClient';

export interface EnsureChainIdParams {
  chainId: number;
}

export async function ensureChainId(client: ExtendedTestClient | ExtendedRealClient, { chainId }: EnsureChainIdParams) {
  const actualChainId = await client.getChainId();
  if (chainId !== actualChainId) {
    throw new Error(`Anvil chain is ${chainId}, but this test expects it to be ${actualChainId}!`);
  }
}
