import { KernelValidator } from '@zerodev/sdk';

import { PrivateKeyAccount } from 'viem';

import { AAManager } from '../AAManager/AAManager';
import { AAManagerEntryPoint } from '../AAManager/EntryPoint';
import { chain_id as ChainId, createApiClient as createAuthClient } from '../api/auth/__generated__/createApiClient';
import { SavingsBackendClient } from '../api/SavingsBackendClient';
import { createApiClient as createSKAClient } from '../api/ska/__generated__/createApiClient';
import { SavingsAccount } from '../SavingsAccount/SavingsAccount';

import type { ZodiosOptions } from '@zodios/core';

export interface CreateSavingsAccountFromKernelValidatorParams {
  sudoValidator: KernelValidator<AAManagerEntryPoint>;
  privateKeyAccount: PrivateKeyAccount; // TODO: @merlin maybe we should not store this for sec reasons
  bundlerChainAPIKey: string;
  sponsorshipAPIKey: string;
  chainId: ChainId;
  savingsBackendUrl: string;
  zodiosOptions?: Partial<ZodiosOptions>;
}

export async function createSavingsAccountFromSudoValidator({
  sudoValidator,
  privateKeyAccount,

  // TODO: @merlin think how to pass these not via params
  // since external wallet code doesn't need to know about this
  bundlerChainAPIKey,
  sponsorshipAPIKey,
  chainId,
  savingsBackendUrl,

  zodiosOptions,
}: CreateSavingsAccountFromKernelValidatorParams) {
  const aaManager = new AAManager({ sudoValidator, bundlerChainAPIKey, sponsorshipAPIKey, chainId, privateKeyAccount });
  await aaManager.init();

  const authClient = createAuthClient(savingsBackendUrl, zodiosOptions);
  const skaClient = createSKAClient(savingsBackendUrl, zodiosOptions);

  return new SavingsAccount({
    aaManager,
    savingsBackendClient: new SavingsBackendClient({ skaClient, authClient, chainId }),
    chainId,
  });
}
