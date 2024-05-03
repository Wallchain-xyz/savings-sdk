import { UserOperation } from 'permissionless';
import { createPimlicoBundlerClient, createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';

import { Transport } from 'viem';

import { KernelVersion, entryPoint } from './EntryPoint';

import type { PartialBy } from 'viem/types/utils';

type UserOperationToSponsor = PartialBy<
  UserOperation<KernelVersion>,
  'callGasLimit' | 'preVerificationGas' | 'verificationGasLimit'
>;

function getSponsorshipPolicyIdByChainId(chainId: number) {
  switch (chainId) {
    case 1:
      return 'sp_hot_captain_flint';
    case 56:
      return 'sp_third_dakota_north';
    case 8453:
      return 'sp_condemned_la_nuit';
    case 42161:
      return 'sp_far_big_bertha';
    default:
      throw new Error(`Unsupported chainId - ${chainId}`);
  }
}

interface CreateSponsorUserOperationParams {
  paymasterTransport: Transport;
  chainId: number;
}

export function createSponsorUserOperation({ paymasterTransport, chainId }: CreateSponsorUserOperationParams) {
  const sponsorshipPolicyId = getSponsorshipPolicyIdByChainId(chainId);

  const pimlicoPaymasterClient = createPimlicoPaymasterClient({
    entryPoint,
    transport: paymasterTransport,
  });

  const bundlerClient = createPimlicoBundlerClient({
    entryPoint,
    transport: paymasterTransport,
  });

  return async ({ userOperation }: { userOperation: UserOperationToSponsor }) => {
    const gasPrices = await bundlerClient.getUserOperationGasPrice();
    const sponsorableUserOperation = {
      ...userOperation,
      maxFeePerGas: gasPrices.standard.maxFeePerGas, // if using Pimlico
      maxPriorityFeePerGas: gasPrices.standard.maxPriorityFeePerGas,
    };
    const sponsoredUserOperation = await pimlicoPaymasterClient.sponsorUserOperation({
      userOperation: sponsorableUserOperation,
      sponsorshipPolicyId,
    });

    return {
      ...sponsorableUserOperation,
      ...sponsoredUserOperation,
    };
  };
}
