import { KernelValidator } from '@zerodev/sdk';

import { AAManager } from '../AAManager/AAManager';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { NetworkEnum, createApiClient } from '../api/thecat/__generated__/createApiClient';
import { SavingsAccount } from '../SavingsAccount/SavingsAccount';

export interface CreateSavingsAccountFromKernelValidatorParams {
  sudoValidator: KernelValidator;
  bundlerChainAPIKey: string;
  sponsorshipAPIKey: string;
  chainId: NetworkEnum;
  savingsBackendUrl: string;
  savingsBackendHeaders: { [p: string]: string };
}

export async function createSavingsAccountFromSudoValidator({
  sudoValidator,
  bundlerChainAPIKey,
  sponsorshipAPIKey,
  chainId,
  savingsBackendUrl,
  savingsBackendHeaders,
}: CreateSavingsAccountFromKernelValidatorParams) {
  const aaManager = new AAManager({ sudoValidator, bundlerChainAPIKey, sponsorshipAPIKey, chainId });
  await aaManager.init();

  const apiClient = createApiClient(savingsBackendUrl, {
    axiosConfig: {
      headers: savingsBackendHeaders,
    },
  });

  return new SavingsAccount({
    aaManager,
    savingsBackendClient: new SavingsBackendClient({ apiClient, chainId }),
    chainId,
  });
}
