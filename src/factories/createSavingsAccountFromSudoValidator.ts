import { KernelValidator } from '@zerodev/sdk';

import { AAManager } from '../AAManager/AAManager';
import { createApiClient } from '../api/createApiClient';
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

  const savingsBackendClient = createApiClient(savingsBackendUrl, {
    axiosConfig: {
      headers: savingsBackendHeaders,
    },
  });

  return new SavingsAccount({
    aaManager,
    savingsBackendClient,
  });
}
