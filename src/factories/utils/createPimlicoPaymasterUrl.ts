import { SupportedChainId } from '../../AAProviders/shared/chains';

const chainPrefixByChainId: Record<SupportedChainId, string> = {
  1: 'ethereum',
  8453: 'base',
  84532: 'base-sepolia',
  56: 'binance',
  42161: 'arbitrum',
};

export interface CreatePimlicoPaymasterUrlParams {
  chainId: SupportedChainId;
  apiKey: string;
}

export function createPimlicoPaymasterUrl({ chainId, apiKey }: CreatePimlicoPaymasterUrlParams): string {
  const chainPrefix = chainPrefixByChainId[chainId];
  return `https://api.pimlico.io/v2/${chainPrefix}/rpc?apikey=${apiKey}`;
}
