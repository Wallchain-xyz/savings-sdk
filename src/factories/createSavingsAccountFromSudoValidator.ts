import { KernelValidator } from '@zerodev/sdk';

import { PrivateKeyAccount } from 'viem';

import { AAManager } from '../AAManager/AAManager';
import { chain_id as ChainId, createApiClient as createAuthClient } from '../api/auth/__generated__/createApiClient';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { createApiClient as createSKAClient } from '../api/ska/__generated__/createApiClient';
import { SavingsAccount } from '../SavingsAccount/SavingsAccount';

export interface CreateSavingsAccountFromKernelValidatorParams {
  sudoValidator: KernelValidator;
  privateKeyAccount: PrivateKeyAccount; // TODO: @merlin maybe we should not store this for sec reasons
  bundlerChainAPIKey: string;
  sponsorshipAPIKey: string;
  chainId: ChainId;
  savingsBackendUrl: string;
}

export async function createSavingsAccountFromSudoValidator({
  sudoValidator,
  privateKeyAccount,
  bundlerChainAPIKey,
  sponsorshipAPIKey,
  chainId,
  savingsBackendUrl,
}: CreateSavingsAccountFromKernelValidatorParams) {
  const aaManager = new AAManager({ sudoValidator, bundlerChainAPIKey, sponsorshipAPIKey, chainId, privateKeyAccount });
  await aaManager.init();
  const authClient = createAuthClient(savingsBackendUrl);

  const skaClient = createSKAClient(savingsBackendUrl);

  return new SavingsAccount({
    aaManager,
    savingsBackendClient: new SavingsBackendClient({ skaClient, authClient, chainId }),
    chainId,
  });
}
