import { KernelValidator } from '@zerodev/sdk';

import { Chain, PrivateKeyAccount, hexToBigInt, toHex } from 'viem';

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
  apiKey: string;
  chainId: ChainId;
  savingsBackendUrl: string;
  zodiosOptions?: Partial<ZodiosOptions>;
}

export async function createSavingsAccountFromSudoValidator({
  sudoValidator,
  privateKeyAccount,

  // TODO: @merlin think how to pass these not via params
  // since external wallet code doesn't need to know about this
  apiKey,
  chainId,
  savingsBackendUrl,

  zodiosOptions,
}: CreateSavingsAccountFromKernelValidatorParams) {
  const authClient = createAuthClient(savingsBackendUrl, zodiosOptions);
  const skaClient = createSKAClient(savingsBackendUrl, zodiosOptions);
  const savingsBackendClient = new SavingsBackendClient({ skaClient, authClient, chainId });

  const aaManager: AAManager<Chain> = new AAManager({
    sudoValidator,
    apiKey,
    chainId,
    privateKeyAccount,
    async getSponsorshipInfo(userOperation) {
      const sponsorshipInfo = await savingsBackendClient.getSponsorshipInfo({
        chainId,
        userOperation: {
          ...userOperation,
          nonce: toHex(userOperation.nonce),
          maxFeePerGas: toHex(userOperation.maxFeePerGas),
          maxPriorityFeePerGas: toHex(userOperation.maxPriorityFeePerGas),
        },
      });
      return {
        paymasterAndData: sponsorshipInfo.paymasterAndData,
        maxFeePerGas: hexToBigInt(sponsorshipInfo.maxFeePerGas),
        maxPriorityFeePerGas: hexToBigInt(sponsorshipInfo.maxPriorityFeePerGas),
        preVerificationGas: hexToBigInt(sponsorshipInfo.preVerificationGas),
        verificationGasLimit: hexToBigInt(sponsorshipInfo.verificationGasLimit),
        callGasLimit: hexToBigInt(sponsorshipInfo.callGasLimit),
      };
    },
  });

  await aaManager.init();

  return new SavingsAccount({
    aaManager,
    savingsBackendClient,
    chainId,
  });
}
