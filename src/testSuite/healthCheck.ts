/* eslint-disable no-await-in-loop */
import { ENTRYPOINT_ADDRESS_V07, createBundlerClient } from 'permissionless';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const ensureBundlerIsReady = async () => {
  const bundlerClient = createBundlerClient({
    chain: base,
    transport: http('http://localhost:4337'),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await bundlerClient.chainId();
      return;
    } catch {
      // eslint-disable-next-line no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export const ensurePaymasterIsReady = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // mock paymaster will open up this endpoint when ready
      const res = await fetch(`http://localhost:4330/ping`);
      const data = await res.json();
      if (data.message !== 'pong') {
        throw new Error('paymaster not ready yet');
      }

      return;
    } catch {
      // eslint-disable-next-line no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export const ensureAnvilIsReady = async () => {
  const publicClient = createPublicClient({
    chain: base,
    transport: http('http://localhost:8545'),
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await publicClient.getChainId();
      return;
    } catch {
      // eslint-disable-next-line no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};
