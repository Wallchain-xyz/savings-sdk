import { http as web3HTTPTransport } from 'viem';

function getChainPrefixByChainId(chainId: number) {
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
  chainId: number;
}

export function createRPCTransport({ chainId }: CreateRPCTransportParams) {
  const chainPrefix = getChainPrefixByChainId(chainId);
  const pimlicoPaymasterURL = `https://rpc.ankr.com/${chainPrefix}`;
  return web3HTTPTransport(pimlicoPaymasterURL);
}
