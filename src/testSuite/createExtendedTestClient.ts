import { Chain, createTestClient, http, publicActions, walletActions } from 'viem';

import { base } from 'viem/chains';

export function createExtendedTestClient(chain: Chain = base) {
  return createTestClient({
    chain,
    mode: 'anvil',
    transport: http('http://localhost:8545'),
  })
    .extend(publicActions)
    .extend(walletActions);
}

export type ExtendedTestClient = ReturnType<typeof createExtendedTestClient>;
