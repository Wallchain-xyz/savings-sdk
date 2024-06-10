import { PrivateKeyAccount } from 'viem';

import { SupportedChainId, getChainById } from '../AAProviders/shared/chains';

import { ZerodevAAProvider } from '../AAProviders/zerodev/ZerodevAAProvider';

export interface CreateAaAccountParams {
  privateKeyAccount: PrivateKeyAccount;
  chainId: SupportedChainId;
  bundlerUrl: string;
  rpcUrl?: string;
}

export async function createAaAccount({ chainId, privateKeyAccount, rpcUrl, bundlerUrl }: CreateAaAccountParams) {
  const chain = getChainById(chainId);

  const aaProvider = new ZerodevAAProvider({
    chain,
    bundlerUrl,
    rpcUrl,
  });

  return aaProvider.createAAAccount(privateKeyAccount);
}
