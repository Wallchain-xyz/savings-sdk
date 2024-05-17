import { http } from 'viem';

import { SupportedChainId } from '../SupportedChain';

const chainPrefixByChainId: Record<SupportedChainId, string> = {
  1: 'ethereum',
  8453: 'base',
  56: 'binance',
  42161: 'arbitrum',
};

interface CreatePimlicoTransportParams {
  chainId: SupportedChainId;
  pimlicoApiKey: string;
}

export function createPimlicoTransport({ chainId, pimlicoApiKey }: CreatePimlicoTransportParams) {
  const chainPrefix = chainPrefixByChainId[chainId];
  const pimlicoURL = `https://api.pimlico.io/v2/${chainPrefix}/rpc?apikey=${pimlicoApiKey}`;
  return http(pimlicoURL);
}
