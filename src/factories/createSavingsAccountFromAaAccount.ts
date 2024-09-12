import { PimlicoPaymaster } from '../AAProviders/pimlico/PimlicoPaymaster';
import { WaitForUserOpToLandParams } from '../AAProviders/shared/AAAccount';
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
  waitForUserOpToLandParams?: WaitForUserOpToLandParams;
  paymasterUrl?: string;
}

// TODO: @merlin maybe should be rewritten to use sudoValidator
export function createSavingsAccountFromAaAccount({
  savingsBackendUrl,
  zodiosOptions,
  apiListeners,
  waitForUserOpToLandParams,

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
  aaAccount.setWaitForUserOpToLandParams(waitForUserOpToLandParams);

  return new SavingsAccount({
    aaAccount,
    privateKeyAccount,
    savingsBackendClient,
    strategiesManager,
    chainId,
  });
}
