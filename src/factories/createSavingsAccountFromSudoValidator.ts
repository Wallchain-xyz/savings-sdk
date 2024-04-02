import { KernelValidator } from '@zerodev/sdk';

import { AAManager } from '../AAManager/AAManager';
import { createApiClient } from '../api/createApiClient';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { SavingsAccount } from '../SavingsAccount/SavingsAccount';

interface CreateSavingsAccountFromKernelValidatorParams {
  sudoValidator: KernelValidator;
  bundlerAPIKey: string;
  savingsBackendUrl: string;
  savingsBackendHeaders: { [p: string]: string };
}

export async function createSavingsAccountFromSudoValidator({
  sudoValidator,
  bundlerAPIKey,
  savingsBackendUrl,
  savingsBackendHeaders,
}: CreateSavingsAccountFromKernelValidatorParams) {
  const aaManager = new AAManager({ sudoValidator, bundlerAPIKey });
  await aaManager.init();

  const apiClient = createApiClient(savingsBackendUrl, {
    axiosConfig: {
      headers: savingsBackendHeaders,
    },
  });

  return new SavingsAccount({
    aaManager,
    savingsBackendClient: new SavingsBackendClient({ apiClient }),
  });
}
