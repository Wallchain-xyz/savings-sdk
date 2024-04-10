import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';
import { http as web3HTTPTransport } from 'viem';

const ENTRYPOINT_ADDRESS_V06 = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

export interface UserOperation {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  nonce: bigint;
  signature: `0x${string}`;
  sender: `0x${string}`;
  initCode: `0x${string}`;
  callData: `0x${string}`;
}

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
    transport: pimlicoPaymasterTransport,
  });

  return async ({ userOperation }: { userOperation: UserOperation }) => {
    const sponsoredUserOperation = await pimlicoPaymasterClient.sponsorUserOperation({
      userOperation,
      sponsorshipPolicyId,
      entryPoint: ENTRYPOINT_ADDRESS_V06,
    });

    return {
      ...userOperation,
      ...sponsoredUserOperation,
    };
  };
}
