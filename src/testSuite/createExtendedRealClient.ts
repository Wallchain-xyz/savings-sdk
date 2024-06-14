import { createClient, http, publicActions, walletActions } from 'viem';

import { base } from 'viem/chains';

export function createExtendedRealClient() {
  return createClient({
    chain: base,
    transport: http(),
  })
    .extend(publicActions)
    .extend(walletActions);
}

export type ExtendedRealClient = ReturnType<typeof createExtendedRealClient>;
