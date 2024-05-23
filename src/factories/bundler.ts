import { SupportedChainId } from './chains';

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

export function getPimlicoBundlerUrl({ chainId, pimlicoApiKey }: CreatePimlicoTransportParams): string {
  const chainPrefix = chainPrefixByChainId[chainId];
  return `https://api.pimlico.io/v2/${chainPrefix}/rpc?apikey=${pimlicoApiKey}`;
}
