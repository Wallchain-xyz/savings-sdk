import { Chain, createClient, http, publicActions, walletActions } from 'viem';

import { base } from 'viem/chains';

export function createExtendedRealClient(chain: Chain = base) {
  return createClient({
    chain,
    transport: http(),
  })
    .extend(publicActions)
    .extend(walletActions);
}

export type ExtendedRealClient = ReturnType<typeof createExtendedRealClient>;
