import { UserOperation } from 'permissionless';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { http as web3HTTPTransport } from 'viem';

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

function getChainPrefixByChainId(chainId: number) {
  switch (chainId) {
    case 1:
      return 'ethereum';
    case 8453:
      return 'base';
    case 56:
      return 'binance';
    case 42161:
      return 'arbitrum';
    default:
      throw new Error(`Unsupported chainId - ${chainId}`);
  }
}

export function createSponsorUserOperation({ pimlicoApiKey, chainId }: { pimlicoApiKey: string; chainId: number }) {
  const sponsorshipPolicyId = getSponsorshipPolicyIdByChainId(chainId);
  const chainPrefix = getChainPrefixByChainId(chainId);
  const pimlicoPaymasterURL = `https://api.pimlico.io/v2/${chainPrefix}/rpc?apikey=${pimlicoApiKey}`;
  const pimlicoPaymasterTransport = web3HTTPTransport(pimlicoPaymasterURL);

  const pimlicoPaymasterClient = createPimlicoPaymasterClient({
    entryPoint,
    transport: pimlicoPaymasterTransport,
  });

  return async ({ userOperation }: { userOperation: UserOperationToSponsor }) => {
    const sponsoredUserOperation = await pimlicoPaymasterClient.sponsorUserOperation({
      userOperation,
      sponsorshipPolicyId,
    });

    return {
      ...userOperation,
      ...sponsoredUserOperation,
    };
  };
}
