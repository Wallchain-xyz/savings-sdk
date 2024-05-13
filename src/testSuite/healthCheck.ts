import { ENTRYPOINT_ADDRESS_V07, createBundlerClient } from 'permissionless';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const MAX_ATTEMPTS_COUNT = 10;

type GetIsReady = () => Promise<unknown>;

function resolveWhenReady(getIsReady: GetIsReady) {
  return new Promise((resolve, reject) => {
    let attemptsCount = 0;
    const intervalId: ReturnType<typeof setInterval> = setInterval(
      () =>
        getIsReady()
          .then(() => resolve(clearInterval(intervalId)))
          .catch(() => {
            attemptsCount++;
            if (attemptsCount > MAX_ATTEMPTS_COUNT) {
              reject(new Error('Max attempts count'));
            }
          }),
      1000,
    );
  });
}

export const ensureBundlerIsReady = async () => {
  const bundlerClient = createBundlerClient({
    chain: base,
    transport: http('http://localhost:4337'),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });
  const getIsBundlerReady = () => bundlerClient.chainId();

  return resolveWhenReady(getIsBundlerReady);
};

export const ensurePaymasterIsReady = async () => {
  const getIsPaymasterReady = () =>
    fetch(`http://localhost:4330/ping`)
      .then(response => response.json())
      .then(response => {
        if (response.message !== 'pong') {
          throw new Error('paymaster not ready yet');
        }
      });

  return resolveWhenReady(getIsPaymasterReady);
};

export const ensureAnvilIsReady = async () => {
  const publicClient = createPublicClient({
    chain: base,
    transport: http('http://localhost:8545'),
  });
  const getIsAnvilReady = () => publicClient.getChainId();

  return resolveWhenReady(getIsAnvilReady);
};
