import { hexToBigInt, toHex } from 'viem';

import { SavingsBackendClient } from '../../api/SavingsBackendClient';
import { SupportedChainId } from '../shared/chains';
import { Paymaster } from '../shared/Paymaster';

import { UserOperationV06 } from '../shared/UserOperationV06';

interface WallchainPaymasterParams {
  savingsBackendClient: SavingsBackendClient;
  chainId: SupportedChainId;
}

export class WallchainPaymaster implements Paymaster {
  private savingsBackendClient: SavingsBackendClient;

  private chainId: SupportedChainId;

  constructor({ savingsBackendClient, chainId }: WallchainPaymasterParams) {
    this.savingsBackendClient = savingsBackendClient;
    this.chainId = chainId;
  }

  async addPaymasterIntoUserOp(userOp: UserOperationV06): Promise<UserOperationV06> {
    const sponsorshipInfo = await this.savingsBackendClient.getSponsorshipInfo({
      chainId: this.chainId,
      userOperation: {
        ...userOp,
        nonce: toHex(userOp.nonce),
        maxFeePerGas: toHex(userOp.maxFeePerGas),
        maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas),
      },
    });
    return {
      ...userOp,
      paymasterAndData: sponsorshipInfo.paymasterAndData,
      maxFeePerGas: hexToBigInt(sponsorshipInfo.maxFeePerGas),
      maxPriorityFeePerGas: hexToBigInt(sponsorshipInfo.maxPriorityFeePerGas),
      preVerificationGas: hexToBigInt(sponsorshipInfo.preVerificationGas),
      verificationGasLimit: hexToBigInt(sponsorshipInfo.verificationGasLimit),
      callGasLimit: hexToBigInt(sponsorshipInfo.callGasLimit),
    };
  }
}
