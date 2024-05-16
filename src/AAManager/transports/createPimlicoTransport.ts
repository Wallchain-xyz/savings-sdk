import { http } from 'viem';

function getChainPrefixByChainId(chainId: number) {
  switch (chainId) {
    case 1:
      return 'ethereum';
    case 8453:
      return 'base';
    case 56:
      return 'binance';
    case 42161:
      return 'arbitrum';
    default:
      throw new Error(`Unsupported chainId - ${chainId}`);
  }
}

interface CreatePimlicoTransportParams {
  chainId: number;
  pimlicoApiKey: string;
}

export function createPimlicoTransport({ chainId, pimlicoApiKey }: CreatePimlicoTransportParams) {
  const chainPrefix = getChainPrefixByChainId(chainId);
  const pimlicoURL = `https://api.pimlico.io/v2/${chainPrefix}/rpc?apikey=${pimlicoApiKey}`;
  return http(pimlicoURL);
}
