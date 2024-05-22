import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { SmartAccountSigner } from 'permissionless/accounts';
import { createPublicClient } from 'viem';

import { entryPoint } from '../AAManager/EntryPoint';
import { createRPCTransport } from '../AAManager/transports/createRPCTransport';

import { chain_id as ChainId } from '../api/auth/__generated__/createApiClient';

import {
  CreateSavingsAccountFromKernelValidatorParams,
  createSavingsAccountFromSudoValidator,
} from './createSavingsAccountFromSudoValidator';

interface CreateYieldAccountParams
  extends Omit<CreateSavingsAccountFromKernelValidatorParams, 'sudoValidator' | 'privateKeyAccount'> {
  privateKeyAccount: SmartAccountSigner & CreateSavingsAccountFromKernelValidatorParams['privateKeyAccount'];
  chainId: ChainId;
}

export async function createSavingsAccountFromPrivateKeyAccount({
  privateKeyAccount,
  chainId,
  ...props
}: CreateYieldAccountParams) {
  const publicClient = createPublicClient({
    transport: createRPCTransport({ chainId }),
  });

  const sudoValidator = await signerToEcdsaValidator(publicClient, {
    entryPoint,
    signer: privateKeyAccount,
  });

  return createSavingsAccountFromSudoValidator({
    privateKeyAccount,
    chainId,
    sudoValidator,
    ...props,
  });
}
