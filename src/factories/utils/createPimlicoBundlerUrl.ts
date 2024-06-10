import { SupportedChainId } from '../../AAProviders/shared/chains';

interface CreatePimlicoBundlerUrlParams {
  chainId: SupportedChainId;
  apiKey: string;
}

export function createPimlicoBundlerUrl({ chainId, apiKey }: CreatePimlicoBundlerUrlParams): string {
  return `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${apiKey}`;
}
