import { createApiClient } from '../api/createApiClient';
import { createAAAccountClientFromPrivateKeyAccount } from '../SavingsSDK';

import { SavingsAccount } from './SavingsAccount';

import type { PrivateKeyAccount } from 'viem';

interface CreateYieldAccountParams {
  privateKeyAccount: PrivateKeyAccount;
  bundlerAPIKey: string;
  savingsBackendUrl: string;
  savingsBackendHeaders: { [key: string]: string };
}

export async function createSavingsAccount({
  privateKeyAccount,
  bundlerAPIKey,
  savingsBackendUrl,
  savingsBackendHeaders,
}: CreateYieldAccountParams) {
  const aaAccountClient = await createAAAccountClientFromPrivateKeyAccount({
    privateKeyAccount,
    bundlerAPIKey,
  });

  const savingsBackendClient = createApiClient(savingsBackendUrl, {
    axiosConfig: {
      headers: savingsBackendHeaders,
    },
  });

  return new SavingsAccount({
    aaAccountClient,
    savingsBackendClient,
    bundlerAPIKey,
    privateKeyAccount,
  });
}
