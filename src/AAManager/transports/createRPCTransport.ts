import { http } from 'viem';

import { SupportedChainId } from '../SupportedChain';

const chainPrefixByChainId: Record<SupportedChainId, string> = {
  1: 'eth',
  8453: 'base',
  56: 'bsc',
  42161: 'arbitrum',
};

interface CreateRPCTransportParams {
  chainId: SupportedChainId;
}

export function createRPCTransport({ chainId }: CreateRPCTransportParams) {
  const chainPrefix = chainPrefixByChainId[chainId];
  const rpcURL = `https://rpc.ankr.com/${chainPrefix}`;
  return http(rpcURL);
}
