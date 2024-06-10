import { CreateAaAccountParams, createAaAccount } from './createAaAccount';
import {
  CreateSavingsAccountFromAaAccountParams,
  createSavingsAccountFromAaAccount,
} from './createSavingsAccountFromAaAccount';
import { createPimlicoBundlerUrl } from './utils/createPimlicoBundlerUrl';

type CreateSavingsAccountFromPrivateKeyAccountParamsBase = Omit<CreateAaAccountParams, 'bundlerUrl'> &
  Omit<CreateSavingsAccountFromAaAccountParams, 'privateKeyAccount' | 'aaAccount'>;

interface CreateBundlerWithApiKeyParams extends CreateSavingsAccountFromPrivateKeyAccountParamsBase {
  apiKey: string;
  bundlerUrl?: never;
}

interface CreateBundlerWithUrlParams extends CreateSavingsAccountFromPrivateKeyAccountParamsBase {
  bundlerUrl: string;
  apiKey?: never;
}

type CreateSavingsAccountFromPrivateKeyAccountParams = CreateBundlerWithApiKeyParams | CreateBundlerWithUrlParams;

export async function createSavingsAccountFromPrivateKeyAccount({
  privateKeyAccount,

  apiKey: bundlerApiKey,
  bundlerUrl,

  chainId,
  rpcUrl,
  paymasterUrl,

  savingsBackendUrl,
  zodiosOptions,
  apiListeners,
}: CreateSavingsAccountFromPrivateKeyAccountParams) {
  const aaAccount = await createAaAccount({
    chainId,
    bundlerUrl: bundlerUrl ?? createPimlicoBundlerUrl({ chainId, apiKey: bundlerApiKey }),
    rpcUrl,
    privateKeyAccount,
  });

  return createSavingsAccountFromAaAccount({
    aaAccount,
    privateKeyAccount,

    chainId,
    rpcUrl,
    paymasterUrl,

    savingsBackendUrl,
    zodiosOptions,
    apiListeners,
  });
}
