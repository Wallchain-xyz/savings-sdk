import { createTestClient, http, publicActions, walletActions } from 'viem';

import { base } from 'viem/chains';

export function createExtendedTestClient() {
  return createTestClient({
    chain: base,
    mode: 'anvil',
    transport: http('http://localhost:8545'),
  })
    .extend(publicActions)
    .extend(walletActions);
}

export type ExtendedTestClient = ReturnType<typeof createExtendedTestClient>;
