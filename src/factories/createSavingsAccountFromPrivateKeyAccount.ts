import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { PrivateKeyAccount, createPublicClient, http } from 'viem';

import {
  CreateSavingsAccountFromKernelValidatorParams,
  createSavingsAccountFromSudoValidator,
} from './createSavingsAccountFromSudoValidator';

interface CreateYieldAccountParams extends Omit<CreateSavingsAccountFromKernelValidatorParams, 'sudoValidator'> {
  privateKeyAccount: PrivateKeyAccount;
}

export async function createSavingsAccountFromPrivateKeyAccount({
  privateKeyAccount,
  bundlerChainAPIKey,
  ...props
}: CreateYieldAccountParams) {
  const aaBundlerTransport = http(`https://rpc.zerodev.app/api/v2/bundler/${bundlerChainAPIKey}`);
  const publicClient = createPublicClient({
    transport: aaBundlerTransport,
  });

  const sudoValidator = await signerToEcdsaValidator(publicClient, {
    signer: privateKeyAccount,
  });

  return createSavingsAccountFromSudoValidator({
    privateKeyAccount,
    bundlerChainAPIKey,
    sudoValidator,
    ...props,
  });
}
