import { Hex } from 'viem';

import { privateKeyToAccount } from 'viem/accounts';

import { CreateSKAccountParams } from '../AAProviders/shared/AAProvider';
import { SupportedChainId, getChainById } from '../AAProviders/shared/chains';
import { SKAccount } from '../AAProviders/shared/SKAccount';
import { ZerodevAAProvider } from '../AAProviders/zerodev/ZerodevAAProvider';

import { createPimlicoPaymaster } from './createPimlicoPaymaster';
import { createPimlicoBundlerUrl } from './utils/createPimlicoBundlerUrl';

interface createSKAccountParams {
  sessionPrivateKey: Hex;

  apiKey: string;
  chainId: SupportedChainId;

  rpcUrl?: string;
  bundlerUrl?: string;
  paymasterUrl?: string;
  serializedSKAData: CreateSKAccountParams['serializedSKAData'];
}

export async function createSKAccount({
  sessionPrivateKey,

  apiKey,
  chainId,

  rpcUrl,
  bundlerUrl,
  paymasterUrl,

  serializedSKAData,
}: createSKAccountParams): Promise<SKAccount> {
  const chain = getChainById(chainId);

  const aaProvider = new ZerodevAAProvider({
    chain,
    bundlerUrl: bundlerUrl ?? createPimlicoBundlerUrl({ chainId, pimlicoApiKey: apiKey }),
    rpcUrl,
  });
  const aaAccount = await aaProvider.createSKAccount({
    skaSigner: privateKeyToAccount(sessionPrivateKey),
    serializedSKAData,
  });
  aaAccount.setPaymaster(
    createPimlicoPaymaster(
      paymasterUrl
        ? {
            paymasterUrl,
          }
        : {
            chainId,
            apiKey,
          },
    ),
  );
  return aaAccount;
}
