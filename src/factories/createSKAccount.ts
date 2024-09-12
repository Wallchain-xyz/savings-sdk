import { Hex } from 'viem';

import { privateKeyToAccount } from 'viem/accounts';

import { PimlicoPaymaster } from '../AAProviders/pimlico/PimlicoPaymaster';
import { WaitForUserOpToLandParams } from '../AAProviders/shared/AAAccount';
import { CreateSKAccountParams as AAProviderCreateSKAccountParams } from '../AAProviders/shared/AAProvider';
import { SupportedChainId, getChainById } from '../AAProviders/shared/chains';
import { SKAccount } from '../AAProviders/shared/SKAccount';
import { ZerodevAAProvider } from '../AAProviders/zerodev/ZerodevAAProvider';

import { createPimlicoBundlerUrl } from './utils/createPimlicoBundlerUrl';
import { createPimlicoPaymasterUrl } from './utils/createPimlicoPaymasterUrl';

interface CreateSKAccountParamsBase {
  sessionPrivateKey: Hex;
  serializedSKAData: AAProviderCreateSKAccountParams['serializedSKAData'];

  chainId: SupportedChainId;

  rpcUrl?: string;
  waitForUserOpToLandParams?: WaitForUserOpToLandParams;
}

interface CreatePaymasterAndBundlerWithApiKeyParams extends CreateSKAccountParamsBase {
  apiKey: string;
  paymasterUrl?: never;
  bundlerUrl?: never;
}

interface CreatePaymasterAndBundlerWithUrlParams extends CreateSKAccountParamsBase {
  paymasterUrl: string;
  bundlerUrl: string;
  apiKey?: never;
}

type CreateSKAccountParams = CreatePaymasterAndBundlerWithApiKeyParams | CreatePaymasterAndBundlerWithUrlParams;

export async function createSKAccount({
  sessionPrivateKey,
  serializedSKAData,
  waitForUserOpToLandParams,

  chainId,

  apiKey,
  bundlerUrl,
  paymasterUrl,

  rpcUrl,
}: CreateSKAccountParams): Promise<SKAccount> {
  const chain = getChainById(chainId);

  const zerodevSupportedBundlerUrl = bundlerUrl ?? createPimlicoBundlerUrl({ chainId, apiKey });
  const aaProvider = new ZerodevAAProvider({
    chain,
    bundlerUrl: zerodevSupportedBundlerUrl,
    rpcUrl,
  });
  const skaAccount = await aaProvider.createSKAccount({
    skaSigner: privateKeyToAccount(sessionPrivateKey),
    serializedSKAData,
  });

  const pimlicoPaymasterUrl = paymasterUrl ?? createPimlicoPaymasterUrl({ chainId, apiKey });
  const pimlicoPaymaster = new PimlicoPaymaster(pimlicoPaymasterUrl);
  skaAccount.setPaymaster(pimlicoPaymaster);
  skaAccount.setWaitForUserOpToLandParams(waitForUserOpToLandParams);

  return skaAccount;
}
