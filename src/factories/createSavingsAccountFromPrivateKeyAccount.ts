import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { PrivateKeyAccount, createPublicClient } from 'viem';

import { createRPCTransport } from '../AAManager/transports/createRPCTransport';
import { entryPoint } from '../AAManager/EntryPoint';

import { chain_id as ChainId } from '../api/auth/__generated__/createApiClient';

import {
  CreateSavingsAccountFromKernelValidatorParams,
  createSavingsAccountFromSudoValidator,
} from './createSavingsAccountFromSudoValidator';

interface CreateYieldAccountParams extends Omit<CreateSavingsAccountFromKernelValidatorParams, 'sudoValidator'> {
  privateKeyAccount: PrivateKeyAccount;
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
