import { ENTRYPOINT_ADDRESS_V06, ENTRYPOINT_ADDRESS_V07, createBundlerClient } from 'permissionless';
import { http } from 'viem';
import { base } from 'viem/chains';
import { beforeAll, describe, expect, test } from 'vitest';

import { ensureBundlerIsReady, ensurePaymasterIsReady } from '../../testSuite/healthCheck';

describe('Test basic bundler functions', () => {
  beforeAll(async () => {
    await ensurePaymasterIsReady();
    await ensureBundlerIsReady();
  });

  test('Can get chainId', async () => {
    const bundlerClient = createBundlerClient({
      chain: base,
      transport: http('http://localhost:4337'),
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    const chainId = await bundlerClient.chainId();

    expect(chainId).toEqual(base.id);
  });

  test('Can get supported entryPoints', async () => {
    const bundlerClient = createBundlerClient({
      chain: base,
      transport: http('http://localhost:4337'),
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    const supportedEntryPoints = await bundlerClient.supportedEntryPoints();

    expect(supportedEntryPoints).toEqual([ENTRYPOINT_ADDRESS_V06, ENTRYPOINT_ADDRESS_V07]);
  });
});
