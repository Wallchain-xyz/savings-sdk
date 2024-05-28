import { SupportedChainId } from '../../AAProviders/shared/chains';

const chainPrefixByChainId: Record<SupportedChainId, string> = {
  1: 'ethereum',
  8453: 'base',
  56: 'binance',
  42161: 'arbitrum',
};

interface CreatePimlicoBundlerUrlParams {
  chainId: SupportedChainId;
  pimlicoApiKey: string;
}

export function createPimlicoBundlerUrl({ chainId, pimlicoApiKey }: CreatePimlicoBundlerUrlParams): string {
  const chainPrefix = chainPrefixByChainId[chainId];
  return `https://api.pimlico.io/v2/${chainPrefix}/rpc?apikey=${pimlicoApiKey}`;
}
