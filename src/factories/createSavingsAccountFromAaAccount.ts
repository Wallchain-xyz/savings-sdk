import { PimlicoPaymaster } from '../AAProviders/pimlico/PimlicoPaymaster';
import { WaitParams } from '../AAProviders/shared/AAAccount';
import { SupportedChainId } from '../AAProviders/shared/chains';
import { Paymaster } from '../AAProviders/shared/Paymaster';
import { PrimaryAAAccount } from '../AAProviders/shared/PrimaryAAAccount';
import { WallchainPaymaster } from '../AAProviders/wallchain/WallchainPaymaster';
import { SavingsAccount, SavingsAccountParams } from '../SavingsAccount/SavingsAccount';

import { CreateSavingsBackendClientParams, createSavingsBackendClient } from './createSavingsBackendClient';
import { createStrategiesManager } from './createStrategiesManager';

export interface CreateSavingsAccountFromAaAccountParams extends CreateSavingsBackendClientParams {
  privateKeyAccount: SavingsAccountParams['privateKeyAccount'];
  aaAccount: PrimaryAAAccount;
  chainId: SupportedChainId;

  rpcUrl?: string;
  waitParams?: WaitParams;
  paymasterUrl?: string;
}

// TODO: @merlin maybe should be rewritten to use sudoValidator
export function createSavingsAccountFromAaAccount({
  savingsBackendUrl,
  zodiosOptions,
  apiListeners,
  waitParams,

  chainId,
  rpcUrl,
  paymasterUrl,

  // paymaster can be changed for this entity
  aaAccount,
  privateKeyAccount,
}: CreateSavingsAccountFromAaAccountParams) {
  const savingsBackendClient = createSavingsBackendClient({ savingsBackendUrl, zodiosOptions, apiListeners });

  const strategiesManager = createStrategiesManager({
    chainId,
    rpcUrl,
    savingsBackendClient,
  });

  const paymaster: Paymaster = paymasterUrl
    ? new PimlicoPaymaster(paymasterUrl)
    : new WallchainPaymaster({
        savingsBackendClient,
        chainId,
      });

  aaAccount.setPaymaster(paymaster);
  aaAccount.setDefaultWaitParams(
    waitParams ?? {
      maxDurationMS: 180_000, // Wait up to 3 minutes
      pollingIntervalMS: 1_000, // Check once a second
    },
  );

  return new SavingsAccount({
    aaAccount,
    privateKeyAccount,
    savingsBackendClient,
    strategiesManager,
    chainId,
  });
}
