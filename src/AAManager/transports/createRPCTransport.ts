import { http } from 'viem';

import { SupportedChainId } from '../SupportedChain';

function getChainPrefixByChainId(chainId: SupportedChainId) {
  switch (chainId) {
    case 1:
      return 'eth';
    case 8453:
      return 'base';
    case 56:
      return 'bsc';
    case 42161:
      return 'arbitrum';
    default:
      throw new Error(`Unsupported chainId - ${chainId}`);
  }
}

interface CreateRPCTransportParams {
  chainId: SupportedChainId;
}

export function createRPCTransport({ chainId }: CreateRPCTransportParams) {
  const chainPrefix = getChainPrefixByChainId(chainId);
  const rpcURL = `https://rpc.ankr.com/${chainPrefix}`;
  return http(rpcURL);
}
