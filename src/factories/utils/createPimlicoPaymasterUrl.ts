import { SupportedChainId } from '../../AAProviders/shared/chains';

export interface CreatePimlicoPaymasterUrlParams {
  chainId: SupportedChainId;
  apiKey: string;
}

export function createPimlicoPaymasterUrl({ chainId, apiKey }: CreatePimlicoPaymasterUrlParams): string {
  return `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${apiKey}`;
}
